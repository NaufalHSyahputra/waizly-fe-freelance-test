import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';
import {
  randomCreatedDate,
  randomTraderName,
  randomId,
  randomArrayItem,
} from '@mui/x-data-grid-generator';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [...oldRows, { id, title: '', status: false, isNew: true }]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'title' },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add record
      </Button>
    </GridToolbarContainer>
  );
}

export default function FullFeaturedCrudGrid() {
  const defaultTheme = createTheme();
  const [rows, setRows] = React.useState([]);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const [isOnAction, setIsOnAction] = React.useState(false);
  const [users, setUsers] = React.useState([]);
  const [user, setUser] = React.useState({ id: "1", name: "Naufal" });
  const [isLoading, setIsLoading] = React.useState(false);
  const [notification, setNotification] = React.useState({
    open: false,
    vertical: 'top',
    horizontal: 'right',
    severity: 'success',
    message: 'Hello World!'
  });
  const { vertical, horizontal, open, message, severity } = notification;

  React.useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      const response = await fetch('https://dummyjson.com/todos/user/' + user.id)
      const data = await response.json()
      let mappedData = data.todos.map(el => {
        return {
          id: el.id,
          title: el.todo,
          status: el.completed
        }
      })
      setRows(mappedData)
      setIsLoading(false)
      setNotification({ ...notification, message: "Data todo Loaded", open: true });
    };
    getData()
  }, [user])

  React.useEffect(() => {
    const getData = async () => {
      const responseUser = await fetch('https://dummyjson.com/users')
      const dataUser = await responseUser.json()
      let mappedDataUser = dataUser.users.map(el => {
        return {
          id: el.id,
          name: el.firstName + " " + el.lastName
        }
      })
      setUsers(mappedDataUser)
      setNotification({ ...notification, message: "Data user Loaded", open: true });

    }
    getData()
  }, [])

  const handleClose = () => {
    setNotification({ ...notification, open: false });
  };

  const handleStatusClick = async (params) => {
    if (params.field !== "status" || isOnAction) {
      return
    }
    const response = await fetch('https://dummyjson.com/todos/' + params.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completed: !params.value,
      })
    })
    if (!response.ok) {
      //404 because new data
      setRows(rows.map((row) => (row.id === params.id ? {
        ...row,
        status: !params.value
      } : row)));
    } else {
      const data = await response.json()
      setRows(rows.map((row) => (row.id === data.id ? {
        id: data.id,
        title: data.todo,
        status: data.completed
      } : row)));
    }
    setNotification({ ...notification, message: "Update Status Success", open: true });
  }

  const handleRowEditStop = (params, event) => {
    setIsOnAction(false)
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setIsOnAction(true)
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setIsOnAction(false)
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => async () => {
    const response = await fetch('https://dummyjson.com/todos/' + id, {
      method: 'DELETE',
    })
    if (response.ok) {
      setRows(rows.filter((row) => row.id !== id));
    }
    setNotification({ ...notification, message: "Delete Todo Success", open: true });

    return response
  };

  const handleCancelClick = (id) => () => {
    setIsOnAction(false)
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = async (newRow) => {
    setIsOnAction(true)
    if (newRow.isNew) {
      const response = await fetch('https://dummyjson.com/todos/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: false,
          userId: 1,
          todo: newRow.title
        })
      })
      const data = await response.json()
      setRows(rows.map((row) => (row.id === newRow.id ? {
        id: data.id,
        title: data.todo,
        status: data.completed
      } : row)))
      setIsOnAction(false);
      setNotification({ ...notification, message: "Create Todo Success", open: true });
      return rows;
    } else {
      const updatedRow = { ...newRow, isNew: false };
      const response = await fetch('https://dummyjson.com/todos/' + updatedRow.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: newRow.status,
          todo: newRow.title
        })
      })
      const data = await response.json()
      setRows(rows.map((row) => (row.id === data.id ? {
        id: data.id,
        title: data.todo,
        status: data.completed
      } : row)));
      setIsOnAction(false)
      setNotification({ ...notification, message: "Update Todo Success", open: true });

      return updatedRow;
    }
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleChangeUser = (val, e) => {
    setUser({
      id: e.props.value,
      name: e.props.children
    })
  }

  const columns = [
    { field: 'id', headerName: 'Id', width: 100, editable: false },
    { field: 'title', headerName: 'Description', width: 520, editable: true },
    { field: 'status', headerName: 'Status', type: 'boolean', width: 120 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            TODO List
          </Typography>
          <br />
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">User</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="User"
              onChange={handleChangeUser}
              value=""
            >
              {
                users.map(element => (
                  <MenuItem value={element.id} key={element.id}>{element.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
          <br />
          <Box
            sx={{
              height: 500,
              width: '100%',
              '& .actions': {
                color: 'text.secondary',
              },
              '& .textPrimary': {
                color: 'text.primary',
              },
            }}
          >
            {
              isLoading ? <CircularProgress /> : (
                <DataGrid
                  rows={rows}
                  columns={columns}
                  editMode="row"
                  rowModesModel={rowModesModel}
                  onRowModesModelChange={handleRowModesModelChange}
                  onRowEditStop={handleRowEditStop}
                  processRowUpdate={processRowUpdate}
                  slots={{
                    toolbar: EditToolbar,
                  }}
                  slotProps={{
                    toolbar: { setRows, setRowModesModel },
                  }}
                  disableRowSelectionOnClick
                  onCellClick={handleStatusClick}
                />
              )
            }
          </Box>
        </Box>
        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={open}
          onClose={handleClose}
          severity={severity}
          key={vertical + horizontal}
        >
          <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}
