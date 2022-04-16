import ImageSearch from "../components/ImageSearch";
import ImageDisplay from "../components/ImageDisplay";
import BasePage from "./BasePage";

function SearchPage({ data, setData }) {
  return (
    <BasePage title="Search">
      <ImageSearch setResults={setData} />
      <ImageDisplay images={data} />
    </BasePage>
  );
}

export default SearchPage;
