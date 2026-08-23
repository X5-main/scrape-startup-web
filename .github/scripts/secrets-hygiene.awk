# Secrets hygiene filter — flags key=value-ish assignments whose value is a
# literal secret (quoted or unquoted, >= 12 chars), while letting documentation
# placeholders through:
#   - $VAR / ${VAR} / $(...) shell or env references
#   - <placeholder> angle-bracketed values
#   - env-var NAME-shaped values (all-uppercase identifiers)
#   - "your_*" snippet placeholders (oc_your_api_key, your-fireflies-api-key, ...)
# Exits nonzero when a literal secret value is found.
# Dependency-free: POSIX awk (gawk/mawk/one-true-awk), no external tools.
BEGIN { bad = 0 }
{
  low = tolower($0)
  pos = 1
  # A key name (api_key / access_key / password / token / secret) followed by an
  # optional = or : separator, then a run of >= 12 non-placeholder characters.
  # Placeholder chars ($ < > and quotes) break the run, so ${VAR}, <tok>, "$x"
  # can never satisfy the length; NAME-shaped all-uppercase values are filtered
  # below, as are values containing "your".
  while (match(substr(low, pos), /((api|access)[-_]?key|password|token|secret)["']?[[:space:]]*[=:][[:space:]]*["']?([^$<>"'\r]{12,})/)) {
    v = substr($0, pos + RSTART - 1, RLENGTH)
    sub(/^[^=:]*[=:][[:space:]]*["']?/, "", v)
    gsub(/["']/, "", v)
    if (v !~ /^\$/)                # $VAR / ${VAR} / $(...) shell or env references
      if (v !~ /^<.*>$/)           # <placeholder> angle-bracketed
        if (v !~ /^[A-Z][A-Z0-9_]*$/)    # env-var NAME-shaped (all-uppercase identifier)
          if (v !~ /your/)         # "your_*" snippet placeholders (oc_your_api_key, ...)
            {
              print FILENAME ":" FNR ": literal secret value: " v
              bad = 1
            }
    pos += RSTART + RLENGTH - 1
  }
}
END { exit bad }
