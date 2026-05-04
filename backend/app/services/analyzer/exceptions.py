class CVAnalysisError(Exception):
    pass

class EmptyCVError(CVAnalysisError):
    pass

class APIError(CVAnalysisError):
    pass

class InvalidResponseError(CVAnalysisError):
    pass

class RateLimitError(APIError):
    pass