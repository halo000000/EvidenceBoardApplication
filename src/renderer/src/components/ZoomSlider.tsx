import './ZoomSlider.css'

interface ZoomSliderProps {
  value: number
  onChange: (value: number) => void
}

function ZoomSlider({ value, onChange }: ZoomSliderProps): React.JSX.Element {
  return (
    <div className="zoom-slider-container">
      <input
        type="range"
        min="0.25"
        max="3"
        step="0.05"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="zoom-slider"
      />
      <div className="zoom-value">{Math.round(value * 100)}%</div>
    </div>
  )
}

export default ZoomSlider
