const Clients = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-primary mb-6">Gestión de Clientes</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <Card label="Alta de cliente" />
        <Card label="Generar QR" />
        <Card label="Lista de clientes" />
        <Card label="Baja de cliente" />
        <Card label="Configuración" />
      </div>
    </div>
  );
};

const Card = ({ label }) => (
  <div className="bg-orange-500 text-white p-4 rounded shadow text-center font-semibold hover:bg-orange-600 cursor-pointer">
    {label}
  </div>
);

export default Clients;
