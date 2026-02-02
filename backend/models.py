from sqlalchemy import Column, Integer, String, DateTime, Float, JSON
from database import Base
from datetime import datetime

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    health_score = Column(Float)
    rows = Column(Integer)
    columns = Column(Integer)
    
    # Paths to output files
    cleaned_data_path = Column(String)
    eda_report_path = Column(String)
    summary_stats_path = Column(String)
    business_summary_path = Column(String)
    
    # Store dynamic stats directly if needed (optional optimization)
    summary_json = Column(JSON) 
