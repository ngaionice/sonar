import { Container, Divider, Stack, Toolbar, Typography } from "@mui/material";
import SearchModule from "../components/SearchModule";
import ImageDisplay from "../components/ImageDisplay";

function SearchPage({ data, setData }) {
  const Title = () => <Typography variant="h4">Search</Typography>;

  return (
    <Container maxWidth="lg">
      <Toolbar />
      <Stack spacing={4}>
        <Title />
        <Divider />
        <SearchModule setResults={setData} />
        <ImageDisplay images={data} />
      </Stack>
    </Container>
  );
}

export default SearchPage;
