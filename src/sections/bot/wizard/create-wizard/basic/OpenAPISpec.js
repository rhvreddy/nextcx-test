import PropTypes from 'prop-types';
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
  Stack,
  Typography,
  TextField,
  FormHelperText, List, ListItem, ListItemButton, ListItemText,
  Paper, Link, CircularProgress, FormControl, Select, MenuItem
} from '@mui/material';
import {useFormik} from 'formik';
import AnimateButton from 'components/@extended/AnimateButton';
import React, {useEffect, useMemo, useRef, useState} from 'react';


const OpenAPISpecForm = ({botFormData, setBotFormData, handleNext, setErrorIndex, handleBack}) => {
  const [aiModelMenu, setAiModelMenu] = useState(["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo", "Llama3.1", "Llama2", "Claude 3.5 Sonnet", "Mixtral-7b", "Mistral-Large-Instruct-2407", "codellama:7b", "codellama:34b", "codellama:70b"])
  const formik = useFormik({
    initialValues: {
      aiModel: botFormData?.aiModel,
      openApiSpec: botFormData?.openApiSpec
    },
    onSubmit: (values) => {
      console.log('form submit & including upload - ', values);
      setBotFormData({
        ...botFormData,
        aiModel: values.aiModel,
        openApiSpec: values.openApiSpec
      });
      handleNext();
    }
  });
  const handleChangeAiModel = (item) => {
    formik.setFieldValue('aiModel', item);
  }

  return (
    <>
      <Typography variant='h6' gutterBottom sx={{mb: 2}}>
        Pick GPT Model and OpenAPI Spec for the Actions
      </Typography>
      <form onSubmit={formik.handleSubmit} id='validation-forms'>
        <Grid container spacing={3} sx={{
          height: "auto", overflowY: "auto", overflowX: "hidden", '::-webkit-scrollbar': {
            width: "4px",
            height: "4px"
          },
          '::-webkit-scrollbar-track': {
            background: "#f1f1f1",
          },
          '::-webkit-scrollbar-thumb': {
            background: "#88888840",
          }
        }} maxHeight={{xs: "45vh", md: "50vh"}}>
          <Grid item xs={12}>
            <Stack spacing={0.5}>
              <FormControl fullWidth>
                <InputLabel>Select AI Model</InputLabel>
                <Select name='aiModel' label="Select AI Model" value={formik.values.aiModel}
                        onChange={(e) => {
                          handleChangeAiModel(e.target.value)
                        }}
                        error={formik.touched.aiModel && Boolean(formik.errors.aiModel)}
                        helpertext={formik.touched.aiModel && formik.errors.aiModel}>
                  {aiModelMenu.map((item, index) =>
                    <MenuItem key={index} value={item}>{item}</MenuItem>
                  )}
                </Select>
                {formik.touched.aiModel && formik.errors.aiModel &&
                  <FormHelperText error id="helper-text-creation-type">{formik.errors.aiModel}</FormHelperText>}
              </FormControl>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={0.5} alignItems='center'>
              <TextField spellCheck='false' id='openAPISpec' name='openApiSpec' placeholder='{
  "openapi": "3.1.0",
  "info": {
    "title": "cc1-gen-ai-app-services",
    "version": "0.1.0"
  },
  "paths": {
    "/api/v1/ping/": {
      "get": {
        "tags": [
          "ping"
        ],
        "summary": "Ping",
        "description": "Ping check endpoint.",
        "operationId": "ping_api_v1_ping__get",
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "additionalProperties": {
                    "type": "string"
                  },
                  "type": "object",
                  "title": "Response Ping Api V1 Ping  Get"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/query/match": {
      "post": {
        "summary": "Get Question Classification",
        "operationId": "get_question_classification_api_v1_query_match_post",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ClosestMatchPayload"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "ClosestMatchPayload": {
        "properties": {
          "query": {
            "type": "string",
            "title": "Query"
          },
          "model": {
            "type": "string",
            "title": "Model",
            "default": "gpt-3.5-turbo"
          },
          "max_retries": {
            "type": "integer",
            "title": "Max Retries",
            "default": 3
          }
        },
        "type": "object",
        "required": [
          "query"
        ],
        "title": "ClosestMatchPayload"
      },
      "HTTPValidationError": {
        "properties": {
          "detail": {
            "items": {
              "$ref": "#/components/schemas/ValidationError"
            },
            "type": "array",
            "title": "Detail"
          }
        },
        "type": "object",
        "title": "HTTPValidationError"
      },
      "ValidationError": {
        "properties": {
          "loc": {
            "items": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "integer"
                }
              ]
            },
            "type": "array",
            "title": "Location"
          },
          "msg": {
            "type": "string",
            "title": "Message"
          },
          "type": {
            "type": "string",
            "title": "Error Type"
          }
        },
        "type": "object",
        "required": [
          "loc",
          "msg",
          "type"
        ],
        "title": "ValidationError"
      }
    }
  }
}'
                         fullWidth
                         multiline rows={5}
                         value={formik.values.openApiSpec || ''}
                         onChange={formik.handleChange}
                         error={formik.touched.openApiSpec && Boolean(formik.errors.openApiSpec)}
                         helperText={formik.touched.openApiSpec && formik.errors.openApiSpec}
                         label='Enter Open API Spec (JSON)'/>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack direction='row' marginRight="6px" justifyContent='space-between' marginBottom="6px">
              <Button onClick={handleBack} sx={{my: 3, ml: 1}}>
                Back
              </Button>
              <AnimateButton>
                <Button variant='contained' type='submit' sx={{my: 3, ml: 1}} onClick={() => setErrorIndex(2)}>
                  Next
                </Button>
              </AnimateButton>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

OpenAPISpecForm.propTypes = {
  handleNext: PropTypes.func,
  setErrorIndex: PropTypes.func
};

export default OpenAPISpecForm;
