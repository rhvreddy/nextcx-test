import { Divider, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from "react";

export default function ModelDetailsCard(props){
  const theme = useTheme();
  const {config, modelName, key} = props;

  return(
    <>
      <Grid container style={{display:"flex",flexDirection:"column",rowGap:"5px",width:"400px",border:"1px solid #aaa",borderRadius:"10px",padding:"10px"}}>
        <Typography variant="h5" sx={{position:"absolute", top:"14px"}}>{config?.modelType}</Typography>
        <Grid item style={{display:"flex",columnGap:"5px",alignItems:"center"}}>
          <Typography style={{fontWeight:"600",fontSize:"18px",color:theme.palette.primary.main}}>
            {config?.modelName || modelName}
          </Typography>
          <Typography style={{fontStyle:"italic"}}>
            {config?.version}
          </Typography>
        </Grid>
        <Grid item style={{display:"flex",columnGap:"5px",alignItems:"center"}}>
          {config?.classification?.map((tag,i)=>{
            return (config?.classification.length-1 === i?<Typography>{tag}</Typography>:<Typography>{tag+" | "}</Typography>)
          })}
        </Grid>
        <Divider style={{width:"100%"}} />
        <Grid item style={{width:"100%",minHeight:"130px",maxHeight:"max-content",textOverflow:"ellipsis",overflowY:"hidden"}}>
          <Typography style={{fontWeight:"900",marginTop:"5px"}}>Description</Typography>
          <Typography title={config?.description}>{config?.description}</Typography>
        </Grid>
        <Grid container spacing={2}>
          {config?.parent_company &&
            <Grid item xs={6}>
              <Typography style={{ fontWeight: "900" }}>Parent Company:</Typography>
              <Typography>{config?.parent_company}</Typography>
            </Grid>
          }
          {`${config?.open_source}` &&
            <Grid item xs={6}>
              <Typography style={{ fontWeight: "900" }}>Open Source:</Typography>
              <Typography>{config?.open_source ? "Yes" : "No"}</Typography>
            </Grid>
          }
          {`${config?.open_weights}` &&
            <Grid item xs={6}>
              <Typography style={{ fontWeight: "900" }}>Open Weights:</Typography>
              <Typography>{config?.open_weights ? "Yes" : "No"}</Typography>
            </Grid>
          }
          {config?.context_length &&
            <Grid item xs={6}>
              <Typography style={{ fontWeight: "900" }}>Context Length:</Typography>
              <Typography>{config?.context_length}</Typography>
            </Grid>
          }
          {`${config?.vision_support}` &&
            <Grid item xs={6}>
              <Typography style={{ fontWeight: "900" }}>Vision Support:</Typography>
              <Typography>{config?.vision_support ? "Yes" : "No"}</Typography>
            </Grid>
          }
          {`${config?.tool_calling}` &&
            <Grid item xs={6}>
              <Typography style={{ fontWeight: "900" }}>Tool Calling:</Typography>
              <Typography>{config?.tool_calling ? "Yes" : "No"}</Typography>
            </Grid>
          }
          {config?.n_parameters &&
            <Grid item xs={6} style={{marginTop:"5px"}}>
              <Typography style={{fontWeight:"900",marginTop:"5px"}}>n parameters:</Typography>
              <Grid item style={{display:"flex",columnGap:"5px",alignItems:"center"}}>
                {config?.n_parameters?.length > 0
                  ? config?.n_parameters.map((attribute,i) => {
                    return (config?.n_parameters.length-1 === i?<Typography>{attribute}</Typography>:<Typography>{attribute+" , "}</Typography>)
                  })
                  : 'null'}
              </Grid>
            </Grid>
          }
          {config?.release_date &&
            <Grid item xs={6} style={{marginTop:"5px"}}>
              <Typography style={{fontWeight:"900",marginTop:"5px"}}>Release Date:</Typography>
              <Typography >{config?.release_date}</Typography>
            </Grid>
          }
        </Grid>

        {/*<Grid item style={{marginTop:"5px"}}>*/}
        {/*  <Typography style={{fontWeight:"900",marginTop:"5px"}}>Model Id:</Typography>*/}
        {/*  <Typography >{config?.modelId} </Typography>*/}
        {/*</Grid>*/}

      </Grid>
    </>
  )
}
