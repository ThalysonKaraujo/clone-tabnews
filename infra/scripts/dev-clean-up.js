const { spawn, spawnSync } = require("child_process");
// LINHA REMOVIDA: const process = "process";

let isCleaningUp = false;
let currentChildProcess = null; // Rastreia o processo filho ativo

/**
 * Função de limpeza universal.
 * Mata o processo filho atual e pára os serviços docker.
 */
function cleanupAndExit(exitCode = 0) {
  if (isCleaningUp) return;
  isCleaningUp = true;

  console.log(
    "\n 🚨 Sinal recebido. Iniciando limpeza e parada dos serviços Docker...",
  );

  // 1. Para o processo filho atual (seja pre-dev ou nextDev)
  if (currentChildProcess && !currentChildProcess.killed) {
    console.log(
      `[Orchestrator] Parando o processo filho (PID: ${currentChildProcess.pid})...`,
    );
    currentChildProcess.kill(); // Envia SIGTERM (padrão)
  }

  // 2. Roda a limpeza (services:stop) de forma SÍNCRONA
  // Usar 'spawnSync' é crucial aqui para garantir que o Node
  // espere a limpeza terminar antes de sair.
  console.log("[Orchestrator] Executando 'npm run services:stop'...");
  const cleanupResult = spawnSync("npm", ["run", "services:stop"], {
    stdio: "inherit",
    shell: true,
  });

  if (cleanupResult.status !== 0) {
    console.error("❌ Erro ao tentar parar os serviços Docker.");
  } else {
    console.log("✅ Serviços Docker parados.");
  }

  console.log(`[Orchestrator] Finalizando com código ${exitCode}.`);
  process.exit(exitCode);
}

// --- REGISTRADORES DE SINAL (NÍVEL GLOBAL) ---
// Devem ser registrados imediatamente.

// Captura Ctrl+C
process.on("SIGINT", () => {
  console.log("\n[Orchestrator] Ctrl+C (SIGINT) recebido.");
  cleanupAndExit(130); // 130 é o código padrão para SIGINT
});

// Captura 'kill' (término padrão)
process.on("SIGTERM", () => {
  console.log("\n[Orchestrator] Sinal de término (SIGTERM) recebido.");
  cleanupAndExit(143);
});

// --- LÓGICA DO SCRIPT ---

const preDevCommands = [
  "npm run services:up",
  "npm run services:wait:database",
  "npm run migrations:up",
];

function runPrevDevCommands(commands, callback) {
  if (commands.length == 0) {
    currentChildProcess = null; // Terminou os pre-devs
    callback();
    return;
  }

  const command = commands.shift();
  console.log(`\n➡️ Executando: ${command}`);

  const child = spawn(command, { stdio: "inherit", shell: true });
  currentChildProcess = child; // Rastreia este processo

  child.on("error", (err) => {
    console.log(`❌ Erro ao executar ${command}:`, err);
    cleanupAndExit(1); // Limpa e sai se falhar
  });

  child.on("close", (code) => {
    if (code !== 0) {
      console.error(
        `❌ O comando ${command} falhou com o código de saída ${code}.`,
      );
      cleanupAndExit(1); // Limpa e sai se falhar
      return;
    }
    runPrevDevCommands(commands, callback); // Roda próximo comando
  });
}

// Inicia a cadeia de comandos
runPrevDevCommands([...preDevCommands], () => {
  console.log("\n🚀 Iniciando Next.js em modo de desenvolvimento...");

  const nextDev = spawn("next", ["dev"], { stdio: "inherit", shell: true });
  currentChildProcess = nextDev; // Rastreia o nextDev agora

  nextDev.on("error", (err) => {
    console.error("❌ Erro fatal ao iniciar next dev:", err);
    cleanupAndExit(1); // Limpa e sai
  });

  nextDev.on("exit", (code) => {
    // 130 é SIGINT (Ctrl+C), que já é tratado pelo 'process.on("SIGINT")'
    if (code !== 0 && code !== 130) {
      console.log(
        `❌ Next.js foi encerrado inesperadamente com código ${code}.`,
      );
      cleanupAndExit(code); // Limpa e sai
    } else if (code === 0) {
      console.log("✅ Next.js terminou com sucesso.");
      cleanupAndExit(0); // Limpa e sai
    }
    // Se code === 130, o 'SIGINT' handler já cuidou de tudo.
  });
});
