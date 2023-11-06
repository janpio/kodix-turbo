import React from "react";

export function useMediaQuery({ query }: { query: "md" | "lg" }) {
  let widthText = "";

  switch (query) {
    case "md":
      widthText = "(min-width: 768px)";
      break;
    case "lg":
      widthText = "(min-width: 1024px)";
      break;
    default:
      break;
  }

  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const matchQueryList = window.matchMedia(widthText);
    function handleChange(e: MediaQueryListEvent) {
      setMatches(e.matches);
    }
    matchQueryList.addEventListener("change", handleChange);
    return () => {
      matchQueryList.removeEventListener("change", handleChange);
    };
  }, [widthText]);
  return matches;
}
