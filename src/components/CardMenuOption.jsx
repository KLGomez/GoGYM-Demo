import React from 'react';

const CardMenuOption = ({ icon, label, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg 
                flex flex-col items-center justify-start text-center 
                transition-all duration-150 transform hover:scale-105 
                focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[180px]"
    >
      {icon}
      <span className="font-semibold text-xl mt-3 mb-1 text-orange-400">{label}</span>
      <p className="text-sm text-gray-400 flex-grow">{description}</p>
    </button>
  );
};

export default CardMenuOption;
