"""
Utilities for environment variable handling
"""

import os
import re


def resolve_env_vars(template_string):
    """
    Resolve environment variables in a string template.
    Supports ${VAR} syntax for variable substitution.

    Args:
        template_string: String with ${VAR} placeholders

    Returns:
        String with placeholders replaced by environment variable values
    """
    if not template_string:
        return template_string

    pattern = r"\${([^}]+)}"

    def replace_var(match):
        var_name = match.group(1)
        return os.getenv(var_name, "")

    return re.sub(pattern, replace_var, template_string)

