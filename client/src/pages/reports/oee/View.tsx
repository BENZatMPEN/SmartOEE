import Page from "../../../components/Page";
import { Container, Stack } from "@mui/material";
import ReportCriteriaForm from "../../../sections/reports/view/ReportCriteriaForm";
import { RootState } from "../../../redux/store";
import { useSelector } from "react-redux";
import ReportOEEChart from "../../../sections/reports/oee/ReportOeeChart";

export default function OeeReport() {
  const { currentCriteria: criteria } = useSelector((state: RootState) => state.report);
  function genKey() {
    if (!criteria) {
      return "";
    }
    const { oees, products, batches } = criteria;
    const ids = [...oees, ...products, ...batches];
    if (ids.length === 0) {
      return "";
    }
    return `_${ids.join("_")}`;
  }

  // const ability = useContext(AbilityContext);
  // if (!ability.can(RoleAction.Read, RoleSubject.Reports)) {
  //   return <Navigate to={PATH_PAGES.forbidden} />;
  // }

  return (
    <Page title="Report OEE">
      <Container maxWidth={false}>
        <Stack spacing={3}>
          <ReportCriteriaForm
            name={`OEE`}
          />
          {criteria ? (
            <ReportOEEChart criteria={criteria} />
          ) : (
            <></>
          )}
        </Stack>
      </Container>
    </Page>
  );
}
