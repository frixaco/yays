import { handleVideo } from "../actions";

export default function Home() {
  return (
    <div>
      <h1>Hello World</h1>
      <form action={handleVideo}>
        <input type="text" name="videoUrl" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
