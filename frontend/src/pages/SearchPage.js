import SearchModule from "../components/SearchModule";
import ImageDisplay from "../components/ImageDisplay";
import BasePage from "./BasePage";

function SearchPage({ data, setData }) {
  return (
    <BasePage title="Search">
      <SearchModule setResults={setData} />
      <ImageDisplay images={data} />
    </BasePage>
  );
}

export default SearchPage;
