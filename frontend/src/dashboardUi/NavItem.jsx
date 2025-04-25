export function NavItem({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`p-2 text-left rounded ${active ? 'text-blue-400' : 'text-white'} hover:bg-[#00df9a] rounded-xl cursor-pointer duration-300 hover:text-black`}
        >
            {label}
        </button>
    );
}