import BasePage from "./BasePage";
import { UserManager, UserRoleCreator } from "../components/UserManager";
import { useState } from "react";

function ManageUsersPage() {
  const [fetchOnChange, setFetchOnChange] = useState(new Date());

  return (
    <BasePage title="Users">
      <UserRoleCreator setFetchOnChange={setFetchOnChange} />
      <UserManager
        fetchOnChange={fetchOnChange}
        setFetchOnChange={setFetchOnChange}
      />
    </BasePage>
  );
}

export default ManageUsersPage;
