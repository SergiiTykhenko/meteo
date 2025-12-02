import { parseISO, format } from "date-fns";

const formatDateTime = (isoDate: string) =>
  format(parseISO(isoDate), "dd/MM/yyyy, hh:mm a");

export default formatDateTime;
