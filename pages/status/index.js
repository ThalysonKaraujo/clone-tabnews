import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let databaseInfo = "Carregando...";

  if (!isLoading && data) {
    databaseInfo = {
      pgVersion: `Versão: ${data.dependencies.database.version}`,
      openedConnections: `Conexões abertas: ${data.dependencies.database.opened_connections}`,
      maxConnections: `Conexões máximas: ${data.dependencies.database.max_connections}`,
    };
  }
  return (
    <>
      <h2>DATABASE:</h2>
      <li>{databaseInfo.pgVersion}</li>
      <li>{databaseInfo.openedConnections}</li>
      <li>{databaseInfo.maxConnections}</li>
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }
  return (
    <>
      <div> Ultima Atualização: {updatedAtText}</div>
    </>
  );
}
