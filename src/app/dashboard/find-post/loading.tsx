import { Spinner } from "@/components/ui/spinner";

const Loading = () => {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <Spinner size="large" />
    </div>
  );
}
export default Loading