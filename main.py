import joblib 
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel,Field
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware  # backend and frontend merge by using this code 
model = joblib.load('mental_health_model.pkl')
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#At first create pydantic model 
class StudentData(BaseModel):
    Age                     : int = Field(...,gt=6,le=100)
    Gender                 : Literal['male','female']
    Country                : str
    Academic_Level          : Literal['Undergraduate', 'Graduate', 'High School']
    most_Used_Platform      : Literal['Facebook', 'LinkedIn', 'Instagram', 'Snapchat', 'Twitter',
                                    'YouTube', 'TikTok', 'LINE', 'KakaoTalk', 'VKontakte', 'WhatsApp','WeChat']
    
    Purpose_Of_Use          : Literal['Networking', 'Education', 'Entertainment', 'News']
    Avg_Daily_Usage_Hours   : float = Field(...,ge=0,le=24)
    Daily_Unlocks           : int = Field(... , ge=0)
    Study_Hours             : float = Field(... , ge=0 , le=24)
    Physical_Activity_Hours : float = Field(..., ge=0 , le=24)
    Sleep_Hours_Per_Night   : float = Field(... , ge=0,le=24)
    Stress_Level            : Literal['Medium', 'Low', 'Very High', 'High']


top_country = ['Other','India','USA','Canada','Australia','UK','Germany','Mexico',
 'Turkey',
 'France']

# decription what we send 

class PredictionResponse(BaseModel):
    predicted_mental_health_score : float
    
@app.post('/predict',response_model=PredictionResponse)
def  predict(data:StudentData):

    country_group = data.Country if data.Country in top_country else 'Other'
    input_row = pd.DataFrame([{
    'Age'                   : data.Age,
    'Gender'                : data.Gender,
    'Country'               : data.Country,
    'Academic_Level'        : data.Academic_Level,
    'Most_Used_Platform'    : data.most_Used_Platform,
    'Purpose_Of_Use'        : data.Purpose_Of_Use, 
    'Avg_Daily_Usage_Hours' : data.Avg_Daily_Usage_Hours,   
    'Daily_Unlocks'          : data.Daily_Unlocks,
    'Study_Hours'             : data.Study_Hours,
    'Physical_Activity_Hours'  : data.Physical_Activity_Hours,
    'Sleep_Hours_Per_Night'   : data.Sleep_Hours_Per_Night,
    'Stress_Level'            : data.Stress_Level,
    'Grouped_columns'         : country_group

    }])

    prediction = model.predict(input_row)[0]
    return PredictionResponse(predicted_mental_health_score=round(float(prediction),2))

