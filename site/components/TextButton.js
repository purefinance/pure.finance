export const TextButton = ({ children, disabled = false, onClick }) => (
  <button
    className={
      disabled
        ? 'text-grayscale-500 cursor-not-allowed'
        : 'text-grayscale-950 hover:text-grayscale-500 cursor-pointer'
    }
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    {children}
  </button>
)
