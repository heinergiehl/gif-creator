interface CarouselButton {
  disabled: boolean
  text: string
  onClick: () => void
}
const CarouselButton: React.FC<CarouselButton> = ({
  disabled,
  onClick,
  text,
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className="btn btn-outline hidden md:block"
  >
    {text}
  </button>
)
export default CarouselButton
