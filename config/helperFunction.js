const getCartType = (type) => {
  if (!type) return "doses";

  const formattedType = type.toLowerCase();

  switch (formattedType) {
    case "addon":
      return "addons";
    case "dose":
      return "doses";
    default:
      return "doses";
  }
};

export default getCartType;
