import { Link } from '../navigation'

function Tabs({ items }) {
  const itemClassnames = 'cursor-pointer block py-3.5 text-md capitalize'
  return (
    <ul
      className={
        'mb-6 flex w-2/3 w-full flex-wrap justify-evenly space-x-4 text-gray-400'
      }
    >
      {items.map(({ href, label, onClick = () => null, selected }) => (
        <li
          className={`${selected ? 'border-b-2 border-black text-black' : ''} `}
          key={label}
        >
          {href ? (
            <Link className={itemClassnames} href={href} onClick={onClick}>
              {label}
            </Link>
          ) : (
            <span className={itemClassnames} onClick={onClick}>
              {label}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

export default Tabs
