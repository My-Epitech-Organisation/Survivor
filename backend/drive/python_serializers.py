from rest_framework import serializers


class PythonExecutionRequestSerializer(serializers.Serializer):
    """Serializer for Python code execution requests"""
    code = serializers.CharField(required=True, allow_blank=False)


class PythonExecutionResultSerializer(serializers.Serializer):
    """Serializer for Python code execution results"""
    output = serializers.CharField(allow_blank=True)
    error = serializers.CharField(allow_blank=True)
    exit_code = serializers.IntegerField()
