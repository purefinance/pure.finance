/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {string} props.href
 * @param {string} [props.title]
 */
export const ExternalLink = ({ children, className, href, title }) => (
  <a
    className={`focus:outline-none text-gray-400 hover:text-black ${className}`}
    href={href}
    rel="noopener noreferrer"
    target="_blank"
    title={title}
  >
    {children}
  </a>
)
