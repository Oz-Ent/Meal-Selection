interface IContainerProps {
  children: React.ReactNode;
}


function Container({ children }: IContainerProps) {
  return <div className="w-full max-w-sm min-h-[600px] bg-white rounded-3xl px-6 py-8 flex flex-col items-center justify-center">{children}</div>;
}

export default Container;