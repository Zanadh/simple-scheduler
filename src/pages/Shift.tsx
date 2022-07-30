import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { makeStyles } from "@material-ui/core/styles";
import { getErrorMessage } from "../helper/error/index";
import { deleteShiftById, getShifts, publishShiftByWeekId } from "../helper/api/shift";
import DataTable from "react-data-table-component";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import { useHistory, useLocation } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "@material-ui/lab/Alert";
import { Link as RouterLink } from "react-router-dom";
import * as DateFns from 'date-fns'
import WeekPicker from "../components/WeekPicker";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { Box, Button, colors } from "@material-ui/core";
import { IShift } from "../interfaces";
import { CheckCircleOutline } from "@material-ui/icons";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
  },
  fab: {
    position: "absolute",
    bottom: 40,
    right: 40,
    backgroundColor: 'white',
    color: theme.color.turquoise
  },
  textPublished: {
    color: colors.teal[200],
    fontSize: 14
  },
  pickerLabel: { fontSize: 16, fontWeight: 600 }
}));

interface ActionButtonProps {
  id: string;
  onDelete: () => void;
  isPublished?: boolean
}
const ActionButton: FunctionComponent<ActionButtonProps> = ({
  id,
  onDelete,
  isPublished
}) => {
  return (
    <div>
      <IconButton
        size="small"
        aria-label="delete"
        component={RouterLink}
        to={`/shift/${id}/edit`}
        disabled={isPublished}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton size="small"
        aria-label="delete"
        onClick={() => onDelete()}
        disabled={isPublished}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </div>
  );
};

const dateTimeToDate = (date: Date): string => {
  return DateFns.format(date, 'yyyy-MM-dd')
}

interface IHistoryState {
  firstDateOfWeek?: Date
}

const Shift = () => {
  const classes = useStyles();
  const history = useHistory<IHistoryState>();
  const { search } = useLocation();

  const [rows, setRows] = useState<IShift[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [firstDateOfWeek, setFirstDateOfWeek] = useState(history.location.state?.firstDateOfWeek || DateFns.startOfWeek(Date.now(), { weekStartsOn: 1 }));

  const isAllShiftPublished = useMemo(() =>
    (!!rows.length && !rows.find(v => v.week?.isPublished === false)), [rows])


  //TODO: select date by url query
  const query = useMemo(() => new URLSearchParams(search), [search]);

  console.log("<<> query", { query: query.get("name"), search })

  const onDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteConfirm(true);
  };

  const onCloseDeleteDialog = () => {
    setSelectedId(null);
    setShowDeleteConfirm(false);
  };

  const getData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrMsg("");
      const { results } = await getShifts({ firstDateOfWeek: dateTimeToDate(firstDateOfWeek), relations: ['week'] });
      setRows(results);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    } finally {
      setIsLoading(false);
    }
  }, [firstDateOfWeek]);



  useEffect(() => {
    getData();
  }, [getData]);

  const columns = [
    {
      name: "Name",
      selector: "name",
      sortable: true,
    },
    {
      name: "Date",
      selector: "date",
      sortable: true,
    },
    {
      name: "Start Time",
      selector: "startTime",
      sortable: true,
    },
    {
      name: "End Time",
      selector: "endTime",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <ActionButton id={row.id} onDelete={() => onDeleteClick(row.id)} isPublished={row.week?.isPublished} />
      ),
    },
  ]
  //TODO: add toast when success
  const deleteDataById = async () => {
    try {
      setDeleteLoading(true);
      setErrMsg("");

      if (selectedId === null) {
        throw new Error("ID is null");
      }

      console.log(deleteDataById);

      await deleteShiftById(selectedId);

      const tempRows = [...rows];
      const idx = tempRows.findIndex((v: any) => v.id === selectedId);
      tempRows.splice(idx, 1);
      setRows(tempRows);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    } finally {
      setDeleteLoading(false);
      onCloseDeleteDialog();
    }
  };

  //TODO: add toast when success
  const handleClickPublish = async () => {
    try {
      const weekId = rows[0].week?.id
      if (!weekId) return;

      await publishShiftByWeekId(weekId);
      getData()
    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    }
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} >
        <Card className={classes.root}>
          <CardContent>
            {errMsg.length > 0 ? (
              <Alert severity="error">{errMsg}</Alert>
            ) : (
              <></>
            )}
            <Box display="flex" justifyContent="space-between" padding={2} flexWrap="wrap-reverse">
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <WeekPicker onWeekChange={setFirstDateOfWeek} selectedStartDate={firstDateOfWeek} InputProps={{ className: clsx(classes.pickerLabel, isAllShiftPublished && classes.textPublished), disableUnderline: true }} />
              </MuiPickersUtilsProvider>

              <Box display="flex" gridGap={8} alignItems="center" flexWrap="wrap-reverse">
                {isAllShiftPublished && (<span className={classes.textPublished}> <CheckCircleOutline style={{ fontSize: 16 }} /> Week published on {DateFns.format(new Date(), 'dd MMM yyy h:mm a')}</span>)}
                <Box display="flex" gridGap={8}>
                  <Button variant="outlined" color="primary" disabled={isAllShiftPublished} onClick={() => history.push("/shift/add", { firstDateOfWeek })}>ADD SHIFT</Button>
                  <Button variant="contained" color="primary" disabled={isAllShiftPublished || !rows.length} onClick={handleClickPublish}> PUBLISH</Button>
                </Box>
              </Box>

            </Box>
            <DataTable
              columns={columns}
              data={rows}
              pagination
              progressPending={isLoading}
            />
          </CardContent>
        </Card>
      </Grid>
      <ConfirmDialog
        title="Delete Confirmation"
        description={`Do you want to delete this data ?`}
        onClose={onCloseDeleteDialog}
        open={showDeleteConfirm}
        onYes={deleteDataById}
        loading={deleteLoading}
      />
    </Grid >
  );
};

export default Shift;
