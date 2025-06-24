import {
  CreditCardIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const MembershipsAdmin = () => {
  const options = [
    {
      icon: <CreditCardIcon className="w-8 h-8 text-white" />,
      label: "Estado de Membresías",
    },
    {
      icon: <CurrencyDollarIcon className="w-8 h-8 text-white" />,
      label: "Pagos",
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-primary mb-6">Membresías</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((opt, index) => (
          <div
            key={index}
            className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-lg shadow flex flex-col items-center justify-center gap-2 cursor-pointer transition duration-200"
          >
            {opt.icon}
            <span className="font-semibold text-center text-lg">
              {opt.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembershipsAdmin;
