const Loading = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-10 h-10 border-3 border-primary-100 border-t-primary rounded-full animate-spin" />
      {message && <p className="text-sm text-gray-400">{message}</p>}
    </div>
  );
};

export default Loading;
