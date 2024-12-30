import React, {useEffect, useState} from "react";
import {Box, Button, Grid} from "@mui/material";
import MainCard from 'components/MainCard';
import {AgGridReact} from "ag-grid-react";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {REACT_APP_APP_BACK_END_BASE_URL} from "../../config";
import axios from "axios";

const AgGridComponent = (props) =>{


  const [columnDefs, setColumnDefs] = useState([]);
  const [rowData, setRowData] = useState([]);


  const [gridOptions, setGridOptions] = useState({
    columnDefs:columnDefs,
    rowData:rowData,
    defaultColDef: {
      filter: true,
      floatingFilter: true,
      // flex: 1,
      cellRendererFramework: PriceCellRenderer,
     //  resizable: true,
    },
      onCellValueChanged: handleCellValueChanged,
  });

  function PriceCellRenderer(props) {
    if(props.colDef.headerName === 'STATUS') {
      return (
        <div>
          <input
            type="checkbox"
            checked={props.value}
            onChange={(event) => props.setValue(event.target.checked)}
          />
          <span>{props.value ? 'Active' : 'InActive'}</span>
        </div>
      );
    }else {
      return <span>{props.value}</span>;
    }
  }

  useEffect(()=>{
    const config = {
      method: 'post',
      url: REACT_APP_APP_BACK_END_BASE_URL + `/ai-bots/v0/fetch-web-qa-indexed-pages`,
      data: {
      //  "botId": "s_623df5",
        botId:localStorage.getItem('botId')
      }

    };

    axios(config)
      .then((res) => {
        if(res?.data.status === 'success'){
          let botDataObj = res.data.result;
          setRowData([...botDataObj]);
          const columnDefs = Object.keys(botDataObj[0]).map((key) => {
            return {
              headerName: key.toUpperCase(),
              field: key,
              filter: true,
              floatingFilter: true,
              width:'280px'
            };
          });
          // update the grid's column headers and data with the fetched rows
          setColumnDefs([...columnDefs]);
        }

      })
      .catch((err) => {
        console.log('BotBuilder JS -> ', err);
      });

  },[])



  function handleCellValueChanged(event) {
    console.log('Cell value changed:', event.newValue);
  }



  return (
    <Grid container>
      <Grid item xs={12}>
        <MainCard >

          <Box className="ag-theme-alpine" style={{height:500,display:'flex',flexDirection:'column'}} >
            <Button variant={'contained'} width={80} sx={{float:'right',width:'140px',marginBottom:'20px'}}>Save Changes</Button>

            <AgGridReact
              gridOptions={gridOptions}
              columnDefs={columnDefs}
              rowData={rowData}
            //  domLayout={'normal'}
          //    isColumnEditable={gridOptions.isColumnEditable}
              onGridReady={(params) => params.api.sizeColumnsToFit()}

            />
          </Box>
        </MainCard>

        </Grid>
    </Grid>
  )
}


export default  AgGridComponent;
