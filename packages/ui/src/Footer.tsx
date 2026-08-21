export const Footer = () => {
  return (
    <footer className="w-full py-8 text-center bg-white border-t border-gray-100">
      <p className="text-sm font-medium text-gray-400">
        © {new Date().getFullYear()} AssurePay. All rights reserved.
      </p>
      <div className="flex justify-center gap-6 mt-2 text-xs text-gray-400">
        <a href="#" className="hover:text-[#0B0B0B] transition-colors">Privacy</a>
        <a href="#" className="hover:text-[#0B0B0B] transition-colors">Terms</a>
        <a href="#" className="hover:text-[#0B0B0B] transition-colors">Security</a>
      </div>
    </footer>
  );
};