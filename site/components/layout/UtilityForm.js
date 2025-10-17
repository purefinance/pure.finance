import UtilityBox from './UtilityBox'

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {import("react").FormEventHandler} props.onSubmit
 * @param {string} [props.subtitle]
 * @param {string} props.title
 */
const UtilityForm = ({ children, className, onSubmit, subtitle, title }) => (
  <UtilityBox className={className} subtitle={subtitle} title={title}>
    <form onSubmit={onSubmit}>{children}</form>
  </UtilityBox>
)

export default UtilityForm
