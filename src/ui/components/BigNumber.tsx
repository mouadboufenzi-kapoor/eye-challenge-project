interface BigNumberProps {
  value: number
}

export function BigNumber({ value }: BigNumberProps) {
  return <div className="ui-big-number">{value}</div>
}
