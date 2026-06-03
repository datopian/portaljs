import { useEffect, useState } from 'react'

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
}

export default function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: Props) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => { setValue(initialValue) }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)
    return () => clearTimeout(timeout)
  // onChange is intentionally excluded — callers must stabilize it with useCallback if needed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, debounce])

  return <input {...props} value={value} onChange={(e) => setValue(e.target.value)} />
}
