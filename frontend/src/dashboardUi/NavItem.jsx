export function NavItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-4 text-sm rounded-lg 
                    ${active ? 'bg-[#00df9a] text-white' : 'text-gray-400 hover:bg-[#00df9a] hover:text-white'}
                    transition-all duration-300 w-full text-left`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
