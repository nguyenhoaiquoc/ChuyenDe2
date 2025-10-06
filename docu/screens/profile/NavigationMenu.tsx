import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Menu, X, ChevronRight } from "lucide-react";

const NavigationMenu = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mobileSubmenu, setMobileSubmenu] = useState<string | number | null>(
        null
    );
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const menuItems = [
        { id: "intro", label: "Giới Thiệu", link: "#intro" },
        {
            id: "men",
            label: "Đồ Nam",
            link: "#men",
            submenu: [
                { label: "Giày Chạy Bộ Nam", link: "#men-running-shoes" },
                { label: "Giày Chạy Địa Hình Nam", link: "#men-trail-shoes" },
                { label: "Áo Chạy Bộ Nam", link: "#men-shirts" },
                { label: "Quần Chạy Bộ Nam", link: "#men-shorts" },
                { label: "Dép Chạy Bộ Nam", link: "#men-sandals" },
                { label: "Giày Dã Ngoại - Leo Núi", link: "#men-hiking" },
            ],
        },
        {
            id: "women",
            label: "Đồ Nữ",
            link: "#women",
            submenu: [
                { label: "Giày Chạy Bộ Nữ", link: "#women-running-shoes" },
                { label: "Giày Chạy Địa Hình Nữ", link: "#women-trail-shoes" },
                { label: "Áo Chạy Bộ Nữ", link: "#women-shirts" },
                { label: "Quần Chạy Bộ Nữ", link: "#women-shorts" },
            ],
        },
        {
            id: "watch",
            label: "Đồng Hồ",
            link: "#watch",
            submenu: [
                { label: "Suunto", link: "#suunto" },
                { label: "Garmin", link: "#garmin" },
                { label: "Coros", link: "#coros" },
            ],
        },
        { id: "sale", label: "Sale", link: "#sale" },
    ];

    useEffect(() => {
        const handleClickOutside = (event: globalThis.MouseEvent) => {
            const target = event.target as Node;
            if (menuRef.current && !menuRef.current.contains(target)) {
                setIsMobileMenuOpen(false);
                setMobileSubmenu(null);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setMobileSubmenu(null);
    };

    const handleSubmenuToggle = (itemId: string | number) => {
        setMobileSubmenu(mobileSubmenu === itemId ? null : itemId);
    };

    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
        setMobileSubmenu(null);
    };

    return (
        <div className="w-full bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4">
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center justify-start space-x-8 py-4">
                    {menuItems.map((item) => (
                        <div
                            key={item.id}
                            className="relative"
                            onMouseEnter={() => setHoveredItem(item.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <a
                                href={item.link}
                                className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 font-medium cursor-pointer transition-colors"
                            >
                                <span>{item.label}</span>
                                {item.submenu && <ChevronDown className="w-4 h-4" />}
                            </a>

                            {/* Desktop Submenu */}
                            {item.submenu && hoveredItem === item.id && (
                                <div className="absolute left-0 top-full mt-2 w-56 bg-white shadow-lg rounded-md py-2 z-50 animate-fadeIn">
                                    {item.submenu.map((subitem, index) => (
                                        <a
                                            key={index}
                                            href={subitem.link}
                                            className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors cursor-pointer"
                                        >
                                            {subitem.label}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between py-4">
                    <button
                        onClick={handleMobileMenuToggle}
                        className="text-gray-700 hover:text-orange-500 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="text-lg font-bold text-orange-500">MSPORTS</div>
                </div>
            </div>

            {/* Mobile Menu Panel */}
            <div
                ref={menuRef}
                className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    } md:hidden overflow-y-auto`}
            >
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="text-lg font-bold text-orange-500">MSPORTS</div>
                    <button
                        onClick={handleMobileMenuToggle}
                        className="text-gray-700 hover:text-orange-500 transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Mobile Menu Items */}
                <div className="py-2">
                    {mobileSubmenu === null ? (
                        // Main Menu
                        menuItems.map((item) => (
                            <div key={item.id} className="border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <a
                                        href={item.link}
                                        onClick={handleLinkClick}
                                        className="flex-1 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors cursor-pointer"
                                    >
                                        {item.label}
                                    </a>
                                    {item.submenu && (
                                        <button
                                            onClick={() => handleSubmenuToggle(item.id)}
                                            className="px-4 py-3 text-gray-700 hover:text-orange-500 transition-colors"
                                            aria-label={`Open ${item.label} submenu`}
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        // Submenu View
                        <div className="animate-slideIn">
                            <button
                                onClick={() => setMobileSubmenu(null)}
                                className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:text-orange-500 transition-colors w-full border-b border-gray-200"
                            >
                                <ChevronRight className="w-5 h-5 transform rotate-180" />
                                <span className="font-medium">Quay lại</span>
                            </button>
                            {menuItems
                                .find((item) => item.id === mobileSubmenu)
                                ?.submenu?.map((subitem, index) => (
                                    <a
                                        key={index}
                                        href={subitem.link}
                                        onClick={handleLinkClick}
                                        className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors border-b border-gray-100 cursor-pointer"
                                    >
                                        {subitem.label}
                                    </a>
                                ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => {
                        setIsMobileMenuOpen(false);
                        setMobileSubmenu(null);
                    }}
                />
            )}

            {/* Placeholder Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div id="intro" className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Giới Thiệu</h2>
                    <p className="text-gray-600">
                        Chào mừng đến với MSPORTS - All for running
                    </p>
                </div>

                <div id="men" className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Đồ Nam</h2>
                    <p className="text-gray-600">Bộ sưu tập đồ chạy bộ dành cho nam</p>
                </div>

                <div id="women" className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Đồ Nữ</h2>
                    <p className="text-gray-600">Bộ sưu tập đồ chạy bộ dành cho nữ</p>
                </div>

                <div id="watch" className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Đồng Hồ</h2>
                    <p className="text-gray-600">Đồng hồ thể thao GPS chuyên dụng</p>
                </div>

                <div id="sale" className="mb-8 p-6 bg-orange-50 rounded-lg">
                    <h2 className="text-2xl font-bold text-orange-600 mb-2">Sale</h2>
                    <p className="text-gray-600">Sản phẩm khuyến mãi đặc biệt</p>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default NavigationMenu;
