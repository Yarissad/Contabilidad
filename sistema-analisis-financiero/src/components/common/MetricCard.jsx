const MetricCard = ({ title, value, subtitle, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-500 via-blue-600 to-blue-700',
    green: 'from-green-500 via-green-600 to-emerald-700',
    purple: 'from-purple-500 via-purple-600 to-indigo-700',
    orange: 'from-orange-500 via-orange-600 to-red-600',
    red: 'from-red-500 via-red-600 to-pink-700',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} text-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 p-6 relative overflow-hidden group`}>
      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-90 mb-2 uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-extrabold mb-2 drop-shadow-lg">{value}</p>
          {subtitle && <p className="text-sm opacity-90 font-medium">{subtitle}</p>}
        </div>
        {icon && (
          <div className="text-5xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 transform group-hover:scale-110 group-hover:rotate-12">
            {icon}
          </div>
        )}
      </div>

      {/* Decoración inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-20"></div>
    </div>
  );
};

export default MetricCard;
