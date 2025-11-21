const Card = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 p-6 border border-gray-100 ${className}`}>
      {title && (
        <h3 className="text-xl font-bold text-gray-800 mb-5 pb-3 border-b-2 border-gradient-to-r from-blue-400 to-purple-500 flex items-center">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </span>
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
