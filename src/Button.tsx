type Props = {
  onClick: (() => void) | null;
  children: string;
};

export default function Button(props: Props) {
  const disabled = props.onClick === null;
  const onClick = props.onClick ?? (() => {});

  return (
    <button disabled={disabled} onClick={onClick}>
      {props.children}
    </button>
  );
}
