import { SearchButton } from "@/components/search-button";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Home() {
  return (
    <div className="">
      <ThemeToggle />
      <SearchButton />
    </div>
  );
}
