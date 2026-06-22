export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Column 1: Logo & Description */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold">
                D
              </div>
              <span className="font-bold text-white">DigitalHub</span>
            </div>
            <p className="text-sm text-slate-400">
              Premium digital products marketplace. Get instant access to resources you need.
            </p>
          </div>

          {/* Column 2: Products */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Products</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="/" className="hover:text-primary transition-colors">
                  Browse Products
                </a>
              </li>
              <li>
                <a href="#featured" className="hover:text-primary transition-colors">
                  Featured Items
                </a>
              </li>
              <li>
                <a href="#categories" className="hover:text-primary transition-colors">
                  Categories
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Account */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Account</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="/auth/login" className="hover:text-primary transition-colors">
                  Sign In
                </a>
              </li>
              <li>
                <a href="/auth/sign-up" className="hover:text-primary transition-colors">
                  Sign Up
                </a>
              </li>
              <li>
                <a href="/cart" className="hover:text-primary transition-colors">
                  My Cart
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
          <p>&copy; {currentYear} DigitalHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
