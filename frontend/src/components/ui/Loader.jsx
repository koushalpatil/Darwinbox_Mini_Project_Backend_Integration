const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      <p className="text-sm font-medium text-emerald-700">{text}</p>
    </div>
  );
};

export default Loader;
