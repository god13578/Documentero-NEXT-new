import { uploadTemplate } from "./actions";
import BuilderForm from "./form";

export default function BuilderPage() {
  return <BuilderForm action={uploadTemplate} />;
}
