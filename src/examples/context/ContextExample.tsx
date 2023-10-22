import React, { createContext } from "react";

const initialCtxValue = {
  numberz: [1, 2, 3],
  removeNumber: (_toBeDeleted: number) => {},
  addNumber: (_toBeAdded: number) => {},
};

const FancyContext = createContext(initialCtxValue);

type Props = {
  children: React.ReactNode;
};
const FancyProvider = ({ children }: Props) => {
  const [ctx, setCtx] = React.useState(initialCtxValue);
  const removeNumber = (toBeDeleted: number) => {
    console.log("removeNumber", toBeDeleted);
    const newNumz = ctx.numberz.filter((x) => x !== toBeDeleted);
    setCtx((prevCtx) => ({ ...prevCtx, numberz: newNumz, toBeDeleted }));
  };
  const addNumber = (toBeAdded: number) => {
    console.log("addNumber");
    const newNumz = [...ctx.numberz, toBeAdded];
    setCtx((prevCtx) => ({ ...prevCtx, numberz: newNumz }));
  };
  console.log("render", ctx);
  return (
    <FancyContext.Provider value={{ ...ctx, removeNumber, addNumber }}>
      {children}
    </FancyContext.Provider>
  );
};

export function ContextExample() {
  return (
    <FancyProvider>
      <CtxReader />
      <CtxWriter />
    </FancyProvider>
  );
}

function CtxReader() {
  const ctx = React.useContext(FancyContext);
  return <div>numbers: {ctx.numberz}</div>;
}

function CtxWriter() {
  const ctx = React.useContext(FancyContext);
  const [inputValue, setInputValue] = React.useState("1");
  return (
    <div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        type={"number"}
      />
      <button onClick={() => ctx.removeNumber(parseInt(inputValue))}>
        remove
      </button>
      <button onClick={() => ctx.addNumber(parseInt(inputValue))}>add</button>
    </div>
  );
}
