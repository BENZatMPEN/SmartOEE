import Page from "../../../components/Page";
import { Container, Stack } from "@mui/material";
import ReportCriteriaForm from "../../../sections/reports/view/ReportCriteriaForm";
import { RootState } from "../../../redux/store";
import { useSelector } from "react-redux";
import ReportCauseChart from "../../../sections/reports/cause/ReportCauseChart";

export default function CauseReport() {
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
    <Page title="Report Cause">
      <Container maxWidth={false}>
        <Stack spacing={3}>
          <ReportCriteriaForm
            name={`Cause`}
          />
          {criteria ? (
            <ReportCauseChart criteria={criteria} />
          ) : (
            <></>
          )}
        </Stack>
      </Container>
    </Page>
  );
}
