import { Container, Divider, Stack, Toolbar, Typography } from "@mui/material";

function BasePage({ title, children }) {
  const PageTitle = () => {
    return <Typography variant="h4">{title}</Typography>;
  };

  return (
    <Container maxWidth="lg">
      <Toolbar />
      <Stack spacing={4}>
        <PageTitle />
        <Divider />
        {children}
      </Stack>
    </Container>
  );
}

export default BasePage;
