(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`f9f12bde-92db-41e4-bd7b-5ae19503c166`,e._sentryDebugIdIdentifier=`sentry-dbid-f9f12bde-92db-41e4-bd7b-5ae19503c166`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";import"./B6UiYoTw.js";var p={toc:[{depth:1,value:`exception`,id:`exception`,children:[{depth:2,value:`Notes on grpclib.GRPCError migration`,id:`notes-on-grpclibgrpcerror-migration`},{depth:2,value:`AlreadyExistsError`,id:`alreadyexistserror`,children:[{depth:3,value:`message`,id:`message`},{depth:3,value:`status`,id:`status`},{depth:3,value:`details`,id:`details`}]},{depth:2,value:`AsyncUsageWarning`,id:`asyncusagewarning`},{depth:2,value:`AuthError`,id:`autherror`,children:[{depth:3,value:`message`,id:`message-1`},{depth:3,value:`status`,id:`status-1`},{depth:3,value:`details`,id:`details-1`}]},{depth:2,value:`ClientClosed`,id:`clientclosed`},{depth:2,value:`ConflictError`,id:`conflicterror`,children:[{depth:3,value:`message`,id:`message-2`},{depth:3,value:`status`,id:`status-2`},{depth:3,value:`details`,id:`details-2`}]},{depth:2,value:`ConnectionError`,id:`connectionerror`},{depth:2,value:`DataLossError`,id:`datalosserror`,children:[{depth:3,value:`message`,id:`message-3`},{depth:3,value:`status`,id:`status-3`},{depth:3,value:`details`,id:`details-3`}]},{depth:2,value:`DeprecationError`,id:`deprecationerror`},{depth:2,value:`DeserializationError`,id:`deserializationerror`},{depth:2,value:`Error`,id:`error`},{depth:2,value:`ExecTimeoutError`,id:`exectimeouterror`},{depth:2,value:`ExecutionError`,id:`executionerror`},{depth:2,value:`FilesystemExecutionError`,id:`filesystemexecutionerror`},{depth:2,value:`FunctionTimeoutError`,id:`functiontimeouterror`},{depth:2,value:`ImageBuildError`,id:`imagebuilderror`},{depth:2,value:`InputCancellation`,id:`inputcancellation`},{depth:2,value:`InteractiveTimeoutError`,id:`interactivetimeouterror`},{depth:2,value:`InternalError`,id:`internalerror`,children:[{depth:3,value:`message`,id:`message-4`},{depth:3,value:`status`,id:`status-4`},{depth:3,value:`details`,id:`details-4`}]},{depth:2,value:`InternalFailure`,id:`internalfailure`},{depth:2,value:`InvalidError`,id:`invaliderror`,children:[{depth:3,value:`message`,id:`message-5`},{depth:3,value:`status`,id:`status-5`},{depth:3,value:`details`,id:`details-5`}]},{depth:2,value:`LogsFetchError`,id:`logsfetcherror`},{depth:2,value:`ModuleNotMountable`,id:`modulenotmountable`},{depth:2,value:`MountUploadTimeoutError`,id:`mountuploadtimeouterror`},{depth:2,value:`NotFoundError`,id:`notfounderror`,children:[{depth:3,value:`message`,id:`message-6`},{depth:3,value:`status`,id:`status-6`},{depth:3,value:`details`,id:`details-6`}]},{depth:2,value:`OutputExpiredError`,id:`outputexpirederror`},{depth:2,value:`PermissionDeniedError`,id:`permissiondeniederror`,children:[{depth:3,value:`message`,id:`message-7`},{depth:3,value:`status`,id:`status-7`},{depth:3,value:`details`,id:`details-7`}]},{depth:2,value:`RemoteError`,id:`remoteerror`},{depth:2,value:`RequestSizeError`,id:`requestsizeerror`},{depth:2,value:`ResourceExhaustedError`,id:`resourceexhaustederror`,children:[{depth:3,value:`message`,id:`message-8`},{depth:3,value:`status`,id:`status-8`},{depth:3,value:`details`,id:`details-8`}]},{depth:2,value:`SandboxFilesystemDirectoryNotEmptyError`,id:`sandboxfilesystemdirectorynotemptyerror`},{depth:2,value:`SandboxFilesystemError`,id:`sandboxfilesystemerror`},{depth:2,value:`SandboxFilesystemFileTooLargeError`,id:`sandboxfilesystemfiletoolargeerror`},{depth:2,value:`SandboxFilesystemIsADirectoryError`,id:`sandboxfilesystemisadirectoryerror`},{depth:2,value:`SandboxFilesystemNotADirectoryError`,id:`sandboxfilesystemnotadirectoryerror`},{depth:2,value:`SandboxFilesystemNotFoundError`,id:`sandboxfilesystemnotfounderror`},{depth:2,value:`SandboxFilesystemPathAlreadyExistsError`,id:`sandboxfilesystempathalreadyexistserror`},{depth:2,value:`SandboxFilesystemPermissionError`,id:`sandboxfilesystempermissionerror`},{depth:2,value:`SandboxTerminatedError`,id:`sandboxterminatederror`},{depth:2,value:`SandboxTimeoutError`,id:`sandboxtimeouterror`},{depth:2,value:`SerializationError`,id:`serializationerror`},{depth:2,value:`ServerWarning`,id:`serverwarning`},{depth:2,value:`ServiceError`,id:`serviceerror`,children:[{depth:3,value:`message`,id:`message-9`},{depth:3,value:`status`,id:`status-9`},{depth:3,value:`details`,id:`details-9`}]},{depth:2,value:`SnapshotCreationError`,id:`snapshotcreationerror`},{depth:2,value:`TimeoutError`,id:`timeouterror`},{depth:2,value:`UnimplementedError`,id:`unimplementederror`,children:[{depth:3,value:`message`,id:`message-10`},{depth:3,value:`status`,id:`status-10`},{depth:3,value:`details`,id:`details-10`}]},{depth:2,value:`VersionError`,id:`versionerror`},{depth:2,value:`VolumeUploadTimeoutError`,id:`volumeuploadtimeouterror`},{depth:2,value:`WorkspaceManagementError`,id:`workspacemanagementerror`},{depth:2,value:`simulate_preemption`,id:`simulate_preemption`}]}],rawContent:`# exception

Modal-specific exception types.

## Notes on \`grpclib.GRPCError\` migration

Historically, the Modal SDK could propagate \`grpclib.GRPCError\` exceptions out
to user code.  As of v1.3, we are in the process of gracefully migrating to
always raising a Modal exception type in these cases. To avoid breaking user
code that relies on catching \`grpclib.GRPCError\`, a subset of Modal exception
types temporarily inherit from \`grpclib.GRPCError\`.

We encourage users to migrate any code that currently catches \`grpclib.GRPCError\`
to instead catch the appropriate Modal exception type. The following mapping
between GRPCError status codes and Modal exception types is currently in use:

\`\`\`
CANCELLED -> ServiceError
UNKNOWN -> ServiceError
INVALID_ARGUMENT -> InvalidError
DEADLINE_EXCEEDED -> ServiceError
NOT_FOUND -> NotFoundError
ALREADY_EXISTS -> AlreadyExistsError
PERMISSION_DENIED -> PermissionDeniedError
RESOURCE_EXHAUSTED -> ResourceExhaustedError
FAILED_PRECONDITION -> ConflictError
ABORTED -> ConflictError
OUT_OF_RANGE -> InvalidError
UNIMPLEMENTED -> UnimplementedError
INTERNAL -> InternalError
UNAVAILABLE -> ServiceError
DATA_LOSS -> DataLossError
UNAUTHENTICATED -> AuthError
\`\`\`

## AlreadyExistsError


\`\`\`python
class AlreadyExistsError(modal.exception.Error, modal.exception._GRPCErrorWrapper)
\`\`\`

Raised when a resource creation conflicts with an existing resource.

\`\`\`python
__init__(self, message=None)
\`\`\`


### message

\`\`\`python
message(self)
\`\`\`


### status

\`\`\`python
status(self)
\`\`\`


### details

\`\`\`python
details(self)
\`\`\`

## AsyncUsageWarning


\`\`\`python
class AsyncUsageWarning(UserWarning)
\`\`\`

Warning emitted when a blocking Modal interface is used in an async context.

## AuthError


\`\`\`python
class AuthError(modal.exception.Error, modal.exception._GRPCErrorWrapper)
\`\`\`

Raised when a client has missing or invalid authentication.

\`\`\`python
__init__(self, message=None)
\`\`\`


### message

\`\`\`python
message(self)
\`\`\`


### status

\`\`\`python
status(self)
\`\`\`


### details

\`\`\`python
details(self)
\`\`\`

## ClientClosed


\`\`\`python
class ClientClosed(modal.exception.Error)
\`\`\`

## ConflictError


\`\`\`python
class ConflictError(modal.exception.InvalidError, modal.exception._GRPCErrorWrapper)
\`\`\`

Raised when a resource conflict occurs between the request and current system state.

\`\`\`python
__init__(self, message=None)
\`\`\`


### message

\`\`\`python
message(self)
\`\`\`


### status

\`\`\`python
status(self)
\`\`\`


### details

\`\`\`python
details(self)
\`\`\`

## ConnectionError


\`\`\`python
class ConnectionError(modal.exception.Error)
\`\`\`

Raised when an issue occurs while connecting to the Modal servers.

## DataLossError


\`\`\`python
class DataLossError(modal.exception.Error, modal.exception._GRPCErrorWrapper)
\`\`\`

Raised when data is lost or corrupted.

\`\`\`python
__init__(self, message=None)
\`\`\`


### message

\`\`\`python
message(self)
\`\`\`


### status

\`\`\`python
status(self)
\`\`\`


### details

\`\`\`python
details(self)
\`\`\`

## DeprecationError


\`\`\`python
class DeprecationError(UserWarning)
\`\`\`

UserWarning category emitted when a deprecated Modal feature or API is used.

## DeserializationError


\`\`\`python
class DeserializationError(modal.exception.Error)
\`\`\`

Raised to provide more context when an error is encountered during deserialization.

## Error


\`\`\`python
class Error(Exception)
\`\`\`

Base class for all Modal errors. See [\`modal.exception\`](https://modal.com/docs/sdk/py/latest/exception)
for the specialized error classes.

**Usage**

\`\`\`python notest
import modal

try:
    ...
except modal.Error:
    # Catch any exception raised by Modal's systems.
    print("Responding to error...")
\`\`\`

## ExecTimeoutError


\`\`\`python
class ExecTimeoutError(modal.exception.TimeoutError)
\`\`\`

Raised when a container process exceeds its execution duration limit and times out.

## ExecutionError


\`\`\`python
class ExecutionError(modal.exception.Error)
\`\`\`

Raised when something unexpected happened during runtime.

## FilesystemExecutionError


\`\`\`python
class FilesystemExecutionError(modal.exception.Error)
\`\`\`

Raised when an unknown error is thrown during a container filesystem operation.

## FunctionTimeoutError


\`\`\`python
class FunctionTimeoutError(modal.exception.TimeoutError)
\`\`\`

Raised when a Function exceeds its execution duration limit and times out.

## ImageBuildError


\`\`\`python
class ImageBuildError(modal.exception.RemoteError)
\`\`\`

Raised when an image build fails.

\`\`\`python
__init__(self, message, image_id)
\`\`\`

## InputCancellation


\`\`\`python
class InputCancellation(BaseException)
\`\`\`

Raised when the current input is cancelled by the task

Intentionally a BaseException instead of an Exception, so it won't get
caught by unspecified user exception clauses that might be used for retries and
other control flow.

## InteractiveTimeoutError


\`\`\`python
class InteractiveTimeoutError(modal.exception.TimeoutError)
\`\`\`

Raised when interactive frontends time out while trying to connect to a container.

## InternalError


\`\`\`python
class InternalError(modal.exception.Error, modal.exception._GRPCErrorWrapper)
\`\`\`

Raised when an internal error occurs in the Modal system.

\`\`\`python
__init__(self, message=None)
\`\`\`


### message

\`\`\`python
message(self)
\`\`\`


### status

\`\`\`python
status(self)
\`\`\`


### details

\`\`\`python
details(self)
\`\`\`

## InternalFailure


\`\`\`python
class InternalFailure(modal.exception.Error)
\`\`\`

Retriable internal error.

## InvalidError


\`\`\`python
class InvalidError(modal.exception.Error, modal.exception._GRPCErrorWrapper)
\`\`\`

Raised when user does something invalid.

\`\`\`python
__init__(self, message=None)
\`\`\`


### message

\`\`\`python
message(self)
\`\`\`


### status

\`\`\`python
status(self)
\`\`\`


### details

\`\`\`python
details(self)
\`\`\`

## LogsFetchError


\`\`\`python
class LogsFetchError(modal.exception.Error)
\`\`\`

Raised when trying to fetch too many logs.

## ModuleNotMountable


\`\`\`python
class ModuleNotMountable(Exception)
\`\`\`

## MountUploadTimeoutError


\`\`\`python
class MountUploadTimeoutError(modal.exception.TimeoutError)
\`\`\`

Raised when a Mount upload times out.

## NotFoundError


\`\`\`python
class NotFoundError(modal.exception.Error, modal.exception._GRPCErrorWrapper)
\`\`\`

Raised when a requested resource was not found.

\`\`\`python
__init__(self, message=None)
\`\`\`


### message

\`\`\`python
message(self)
\`\`\`


### status

\`\`\`python
status(self)
\`\`\`


### details

\`\`\`python
details(self)
\`\`\`

## OutputExpiredError


\`\`\`python
class OutputExpiredError(modal.exception.TimeoutError)
\`\`\`

Raised when the Output exceeds expiration and times out.

## PermissionDeniedError


\`\`\`python
class PermissionDeniedError(modal.exception.Error, modal.exception._GRPCErrorWrapper)
\`\`\`

Raised when a user does not have permission to perform the requested operation.

\`\`\`python
__init__(self, message=None)
\`\`\`


### message

\`\`\`python
message(self)
\`\`\`


### status

\`\`\`python
status(self)
\`\`\`


### details

\`\`\`python
details(self)
\`\`\`

## RemoteError


\`\`\`python
class RemoteError(modal.exception.Error)
\`\`\`

Raised when an error occurs on the Modal server.

## RequestSizeError


\`\`\`python
class RequestSizeError(modal.exception.Error)
\`\`\`

Raised when an operation produces a gRPC request that is rejected by the server for being too large.

## ResourceExhaustedError


\`\`\`python
class ResourceExhaustedError(modal.exception.Error, modal.exception._GRPCErrorWrapper)
\`\`\`

Raised when a server-side resource has been exhausted, e.g. a quota or rate limit.

\`\`\`python
__init__(self, message=None)
\`\`\`


### message

\`\`\`python
message(self)
\`\`\`


### status

\`\`\`python
status(self)
\`\`\`


### details

\`\`\`python
details(self)
\`\`\`

## SandboxFilesystemDirectoryNotEmptyError


\`\`\`python
class SandboxFilesystemDirectoryNotEmptyError(modal.exception.SandboxFilesystemError)
\`\`\`

Raised when a directory is not empty.

## SandboxFilesystemError


\`\`\`python
class SandboxFilesystemError(modal.exception.Error)
\`\`\`

Base class for sandbox filesystem errors.

## SandboxFilesystemFileTooLargeError


\`\`\`python
class SandboxFilesystemFileTooLargeError(modal.exception.SandboxFilesystemError)
\`\`\`

Raised when a file exceeds the maximum allowed size for a read operation in the sandbox.

## SandboxFilesystemIsADirectoryError


\`\`\`python
class SandboxFilesystemIsADirectoryError(modal.exception.SandboxFilesystemError)
\`\`\`

Raised when a file operation in the sandbox targets a directory when it should target a non-directory file.

## SandboxFilesystemNotADirectoryError


\`\`\`python
class SandboxFilesystemNotADirectoryError(modal.exception.SandboxFilesystemError)
\`\`\`

Raised when a path component in the sandbox is not a directory.

## SandboxFilesystemNotFoundError


\`\`\`python
class SandboxFilesystemNotFoundError(modal.exception.SandboxFilesystemError)
\`\`\`

Raised when a file or directory is not found in the sandbox.

## SandboxFilesystemPathAlreadyExistsError


\`\`\`python
class SandboxFilesystemPathAlreadyExistsError(modal.exception.SandboxFilesystemError)
\`\`\`

Raised when a path already exists and the operation requires it to be absent.

## SandboxFilesystemPermissionError


\`\`\`python
class SandboxFilesystemPermissionError(modal.exception.SandboxFilesystemError)
\`\`\`

Raised when permission is denied for a file operation in the sandbox.

## SandboxTerminatedError


\`\`\`python
class SandboxTerminatedError(modal.exception.Error)
\`\`\`

Raised when a Sandbox is terminated for an internal reason.

## SandboxTimeoutError


\`\`\`python
class SandboxTimeoutError(modal.exception.TimeoutError)
\`\`\`

Raised when a Sandbox exceeds its execution duration limit and times out.

## SerializationError


\`\`\`python
class SerializationError(modal.exception.Error)
\`\`\`

Raised to provide more context when an error is encountered during serialization.

## ServerWarning


\`\`\`python
class ServerWarning(UserWarning)
\`\`\`

Warning originating from the Modal server and re-issued in client code.

## ServiceError


\`\`\`python
class ServiceError(modal.exception.Error, modal.exception._GRPCErrorWrapper)
\`\`\`

Raised when an error occurs in basic client/server communication.

\`\`\`python
__init__(self, message=None)
\`\`\`


### message

\`\`\`python
message(self)
\`\`\`


### status

\`\`\`python
status(self)
\`\`\`


### details

\`\`\`python
details(self)
\`\`\`

## SnapshotCreationError


\`\`\`python
class SnapshotCreationError(modal.exception.Error)
\`\`\`

Raised when a Sandbox fails to create an exit snapshot.

## TimeoutError


\`\`\`python
class TimeoutError(modal.exception.Error)
\`\`\`

Base class for Modal timeouts.

## UnimplementedError


\`\`\`python
class UnimplementedError(modal.exception.Error, modal.exception._GRPCErrorWrapper)
\`\`\`

Raised when a requested operation is not implemented or not supported.

\`\`\`python
__init__(self, message=None)
\`\`\`


### message

\`\`\`python
message(self)
\`\`\`


### status

\`\`\`python
status(self)
\`\`\`


### details

\`\`\`python
details(self)
\`\`\`

## VersionError


\`\`\`python
class VersionError(modal.exception.Error)
\`\`\`

Raised when the current client version of Modal is unsupported.

## VolumeUploadTimeoutError


\`\`\`python
class VolumeUploadTimeoutError(modal.exception.TimeoutError)
\`\`\`

Raised when a Volume upload times out.

## WorkspaceManagementError


\`\`\`python
class WorkspaceManagementError(modal.exception.Error)
\`\`\`

Raised when an error occurs while managing a workspace.

## simulate_preemption

\`\`\`python
simulate_preemption(wait_seconds, jitter_seconds=0)
\`\`\`
Utility for simulating a preemption interrupt after \`wait_seconds\` seconds.
The first interrupt is the SIGINT signal. After 30 seconds, a second
interrupt will trigger.

This second interrupt simulates SIGKILL, and should not be caught.
Optionally add between zero and \`jitter_seconds\` seconds of additional waiting before first interrupt.

**Usage**

\`\`\`python notest
import time
from modal.exception import simulate_preemption

simulate_preemption(3)

try:
    time.sleep(4)
except KeyboardInterrupt:
    print("got preempted") # Handle interrupt
    raise
\`\`\`

See https://modal.com/docs/guide/preemption for more details on preemption
handling.
`,meta:{title:`exception`,description:`Modal-specific exception types.`}},{toc:m,rawContent:h,meta:g}=p,re=t(`Notes on <code>grpclib.GRPCError</code> migration`,1),ie=t(`<code>modal.exception</code>`),ae=t(`<!> <p>Modal-specific exception types.</p> <!> <p>Historically, the Modal SDK could propagate <code>grpclib.GRPCError</code> exceptions out
to user code.  As of v1.3, we are in the process of gracefully migrating to
always raising a Modal exception type in these cases. To avoid breaking user
code that relies on catching <code>grpclib.GRPCError</code>, a subset of Modal exception
types temporarily inherit from <code>grpclib.GRPCError</code>.</p> <p>We encourage users to migrate any code that currently catches <code>grpclib.GRPCError</code> to instead catch the appropriate Modal exception type. The following mapping
between GRPCError status codes and Modal exception types is currently in use:</p> <!> <!> <!> <p>Raised when a resource creation conflicts with an existing resource.</p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p>Warning emitted when a blocking Modal interface is used in an async context.</p> <!> <!> <p>Raised when a client has missing or invalid authentication.</p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p>Raised when a resource conflict occurs between the request and current system state.</p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p>Raised when an issue occurs while connecting to the Modal servers.</p> <!> <!> <p>Raised when data is lost or corrupted.</p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p>UserWarning category emitted when a deprecated Modal feature or API is used.</p> <!> <!> <p>Raised to provide more context when an error is encountered during deserialization.</p> <!> <!> <p>Base class for all Modal errors. See <!> for the specialized error classes.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>Raised when a container process exceeds its execution duration limit and times out.</p> <!> <!> <p>Raised when something unexpected happened during runtime.</p> <!> <!> <p>Raised when an unknown error is thrown during a container filesystem operation.</p> <!> <!> <p>Raised when a Function exceeds its execution duration limit and times out.</p> <!> <!> <p>Raised when an image build fails.</p> <!> <!> <!> <p>Raised when the current input is cancelled by the task</p> <p>Intentionally a BaseException instead of an Exception, so it won’t get
caught by unspecified user exception clauses that might be used for retries and
other control flow.</p> <!> <!> <p>Raised when interactive frontends time out while trying to connect to a container.</p> <!> <!> <p>Raised when an internal error occurs in the Modal system.</p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p>Retriable internal error.</p> <!> <!> <p>Raised when user does something invalid.</p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p>Raised when trying to fetch too many logs.</p> <!> <!> <!> <!> <p>Raised when a Mount upload times out.</p> <!> <!> <p>Raised when a requested resource was not found.</p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p>Raised when the Output exceeds expiration and times out.</p> <!> <!> <p>Raised when a user does not have permission to perform the requested operation.</p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p>Raised when an error occurs on the Modal server.</p> <!> <!> <p>Raised when an operation produces a gRPC request that is rejected by the server for being too large.</p> <!> <!> <p>Raised when a server-side resource has been exhausted, e.g. a quota or rate limit.</p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p>Raised when a directory is not empty.</p> <!> <!> <p>Base class for sandbox filesystem errors.</p> <!> <!> <p>Raised when a file exceeds the maximum allowed size for a read operation in the sandbox.</p> <!> <!> <p>Raised when a file operation in the sandbox targets a directory when it should target a non-directory file.</p> <!> <!> <p>Raised when a path component in the sandbox is not a directory.</p> <!> <!> <p>Raised when a file or directory is not found in the sandbox.</p> <!> <!> <p>Raised when a path already exists and the operation requires it to be absent.</p> <!> <!> <p>Raised when permission is denied for a file operation in the sandbox.</p> <!> <!> <p>Raised when a Sandbox is terminated for an internal reason.</p> <!> <!> <p>Raised when a Sandbox exceeds its execution duration limit and times out.</p> <!> <!> <p>Raised to provide more context when an error is encountered during serialization.</p> <!> <!> <p>Warning originating from the Modal server and re-issued in client code.</p> <!> <!> <p>Raised when an error occurs in basic client/server communication.</p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p>Raised when a Sandbox fails to create an exit snapshot.</p> <!> <!> <p>Base class for Modal timeouts.</p> <!> <!> <p>Raised when a requested operation is not implemented or not supported.</p> <!> <!> <!> <!> <!> <!> <!> <!> <!> <p>Raised when the current client version of Modal is unsupported.</p> <!> <!> <p>Raised when a Volume upload times out.</p> <!> <!> <p>Raised when an error occurs while managing a workspace.</p> <!> <!> <p>Utility for simulating a preemption interrupt after <code>wait_seconds</code> seconds.
The first interrupt is the SIGINT signal. After 30 seconds, a second
interrupt will trigger.</p> <p>This second interrupt simulates SIGKILL, and should not be caught.
Optionally add between zero and <code>jitter_seconds</code> seconds of additional waiting before first interrupt.</p> <p><strong>Usage</strong></p> <!> <p>See <!> for more details on preemption
handling.</p>`,1);function _(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=ae(),d=te(a);ne(d,{id:`exception`,children:(e,t)=>{s(),i(e,r(`exception`))},$$slots:{default:!0}});var p=o(d,4);c(p,{id:`notes-on-grpclibgrpcerror-migration`,children:(e,t)=>{s();var n=re();s(2),i(e,n)},$$slots:{default:!0}});var m=o(p,6);u(m,{code:`CANCELLED%20-%3E%20ServiceError%0AUNKNOWN%20-%3E%20ServiceError%0AINVALID_ARGUMENT%20-%3E%20InvalidError%0ADEADLINE_EXCEEDED%20-%3E%20ServiceError%0ANOT_FOUND%20-%3E%20NotFoundError%0AALREADY_EXISTS%20-%3E%20AlreadyExistsError%0APERMISSION_DENIED%20-%3E%20PermissionDeniedError%0ARESOURCE_EXHAUSTED%20-%3E%20ResourceExhaustedError%0AFAILED_PRECONDITION%20-%3E%20ConflictError%0AABORTED%20-%3E%20ConflictError%0AOUT_OF_RANGE%20-%3E%20InvalidError%0AUNIMPLEMENTED%20-%3E%20UnimplementedError%0AINTERNAL%20-%3E%20InternalError%0AUNAVAILABLE%20-%3E%20ServiceError%0ADATA_LOSS%20-%3E%20DataLossError%0AUNAUTHENTICATED%20-%3E%20AuthError`,lang:`text`});var h=o(m,2);c(h,{id:`alreadyexistserror`,children:(e,t)=>{s(),i(e,r(`AlreadyExistsError`))},$$slots:{default:!0}});var g=o(h,2);u(g,{code:`class%20AlreadyExistsError(modal.exception.Error%2C%20modal.exception._GRPCErrorWrapper)`,lang:`python`});var _=o(g,4);u(_,{code:`__init__(self%2C%20message%3DNone)`,lang:`python`});var v=o(_,2);l(v,{id:`message`,children:(e,t)=>{s(),i(e,r(`message`))},$$slots:{default:!0}});var y=o(v,2);u(y,{code:`message(self)`,lang:`python`});var b=o(y,2);l(b,{id:`status`,children:(e,t)=>{s(),i(e,r(`status`))},$$slots:{default:!0}});var x=o(b,2);u(x,{code:`status(self)`,lang:`python`});var S=o(x,2);l(S,{id:`details`,children:(e,t)=>{s(),i(e,r(`details`))},$$slots:{default:!0}});var C=o(S,2);u(C,{code:`details(self)`,lang:`python`});var w=o(C,2);c(w,{id:`asyncusagewarning`,children:(e,t)=>{s(),i(e,r(`AsyncUsageWarning`))},$$slots:{default:!0}});var T=o(w,2);u(T,{code:`class%20AsyncUsageWarning(UserWarning)`,lang:`python`});var E=o(T,4);c(E,{id:`autherror`,children:(e,t)=>{s(),i(e,r(`AuthError`))},$$slots:{default:!0}});var D=o(E,2);u(D,{code:`class%20AuthError(modal.exception.Error%2C%20modal.exception._GRPCErrorWrapper)`,lang:`python`});var O=o(D,4);u(O,{code:`__init__(self%2C%20message%3DNone)`,lang:`python`});var k=o(O,2);l(k,{id:`message-1`,children:(e,t)=>{s(),i(e,r(`message`))},$$slots:{default:!0}});var A=o(k,2);u(A,{code:`message(self)`,lang:`python`});var j=o(A,2);l(j,{id:`status-1`,children:(e,t)=>{s(),i(e,r(`status`))},$$slots:{default:!0}});var M=o(j,2);u(M,{code:`status(self)`,lang:`python`});var N=o(M,2);l(N,{id:`details-1`,children:(e,t)=>{s(),i(e,r(`details`))},$$slots:{default:!0}});var P=o(N,2);u(P,{code:`details(self)`,lang:`python`});var F=o(P,2);c(F,{id:`clientclosed`,children:(e,t)=>{s(),i(e,r(`ClientClosed`))},$$slots:{default:!0}});var I=o(F,2);u(I,{code:`class%20ClientClosed(modal.exception.Error)`,lang:`python`});var L=o(I,2);c(L,{id:`conflicterror`,children:(e,t)=>{s(),i(e,r(`ConflictError`))},$$slots:{default:!0}});var R=o(L,2);u(R,{code:`class%20ConflictError(modal.exception.InvalidError%2C%20modal.exception._GRPCErrorWrapper)`,lang:`python`});var z=o(R,4);u(z,{code:`__init__(self%2C%20message%3DNone)`,lang:`python`});var B=o(z,2);l(B,{id:`message-2`,children:(e,t)=>{s(),i(e,r(`message`))},$$slots:{default:!0}});var V=o(B,2);u(V,{code:`message(self)`,lang:`python`});var H=o(V,2);l(H,{id:`status-2`,children:(e,t)=>{s(),i(e,r(`status`))},$$slots:{default:!0}});var U=o(H,2);u(U,{code:`status(self)`,lang:`python`});var W=o(U,2);l(W,{id:`details-2`,children:(e,t)=>{s(),i(e,r(`details`))},$$slots:{default:!0}});var G=o(W,2);u(G,{code:`details(self)`,lang:`python`});var K=o(G,2);c(K,{id:`connectionerror`,children:(e,t)=>{s(),i(e,r(`ConnectionError`))},$$slots:{default:!0}});var q=o(K,2);u(q,{code:`class%20ConnectionError(modal.exception.Error)`,lang:`python`});var J=o(q,4);c(J,{id:`datalosserror`,children:(e,t)=>{s(),i(e,r(`DataLossError`))},$$slots:{default:!0}});var Y=o(J,2);u(Y,{code:`class%20DataLossError(modal.exception.Error%2C%20modal.exception._GRPCErrorWrapper)`,lang:`python`});var X=o(Y,4);u(X,{code:`__init__(self%2C%20message%3DNone)`,lang:`python`});var Z=o(X,2);l(Z,{id:`message-3`,children:(e,t)=>{s(),i(e,r(`message`))},$$slots:{default:!0}});var oe=o(Z,2);u(oe,{code:`message(self)`,lang:`python`});var se=o(oe,2);l(se,{id:`status-3`,children:(e,t)=>{s(),i(e,r(`status`))},$$slots:{default:!0}});var ce=o(se,2);u(ce,{code:`status(self)`,lang:`python`});var le=o(ce,2);l(le,{id:`details-3`,children:(e,t)=>{s(),i(e,r(`details`))},$$slots:{default:!0}});var ue=o(le,2);u(ue,{code:`details(self)`,lang:`python`});var de=o(ue,2);c(de,{id:`deprecationerror`,children:(e,t)=>{s(),i(e,r(`DeprecationError`))},$$slots:{default:!0}});var fe=o(de,2);u(fe,{code:`class%20DeprecationError(UserWarning)`,lang:`python`});var pe=o(fe,4);c(pe,{id:`deserializationerror`,children:(e,t)=>{s(),i(e,r(`DeserializationError`))},$$slots:{default:!0}});var me=o(pe,2);u(me,{code:`class%20DeserializationError(modal.exception.Error)`,lang:`python`});var he=o(me,4);c(he,{id:`error`,children:(e,t)=>{s(),i(e,r(`Error`))},$$slots:{default:!0}});var ge=o(he,2);u(ge,{code:`class%20Error(Exception)`,lang:`python`});var Q=o(ge,2);f(o(e(Q)),{href:`https://modal.com/docs/sdk/py/latest/exception`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(),n(Q);var _e=o(Q,4);u(_e,{code:`import%20modal%0A%0Atry%3A%0A%20%20%20%20...%0Aexcept%20modal.Error%3A%0A%20%20%20%20%23%20Catch%20any%20exception%20raised%20by%20Modal's%20systems.%0A%20%20%20%20print(%22Responding%20to%20error...%22)`,lang:`python`});var ve=o(_e,2);c(ve,{id:`exectimeouterror`,children:(e,t)=>{s(),i(e,r(`ExecTimeoutError`))},$$slots:{default:!0}});var ye=o(ve,2);u(ye,{code:`class%20ExecTimeoutError(modal.exception.TimeoutError)`,lang:`python`});var be=o(ye,4);c(be,{id:`executionerror`,children:(e,t)=>{s(),i(e,r(`ExecutionError`))},$$slots:{default:!0}});var xe=o(be,2);u(xe,{code:`class%20ExecutionError(modal.exception.Error)`,lang:`python`});var Se=o(xe,4);c(Se,{id:`filesystemexecutionerror`,children:(e,t)=>{s(),i(e,r(`FilesystemExecutionError`))},$$slots:{default:!0}});var Ce=o(Se,2);u(Ce,{code:`class%20FilesystemExecutionError(modal.exception.Error)`,lang:`python`});var we=o(Ce,4);c(we,{id:`functiontimeouterror`,children:(e,t)=>{s(),i(e,r(`FunctionTimeoutError`))},$$slots:{default:!0}});var Te=o(we,2);u(Te,{code:`class%20FunctionTimeoutError(modal.exception.TimeoutError)`,lang:`python`});var Ee=o(Te,4);c(Ee,{id:`imagebuilderror`,children:(e,t)=>{s(),i(e,r(`ImageBuildError`))},$$slots:{default:!0}});var De=o(Ee,2);u(De,{code:`class%20ImageBuildError(modal.exception.RemoteError)`,lang:`python`});var Oe=o(De,4);u(Oe,{code:`__init__(self%2C%20message%2C%20image_id)`,lang:`python`});var ke=o(Oe,2);c(ke,{id:`inputcancellation`,children:(e,t)=>{s(),i(e,r(`InputCancellation`))},$$slots:{default:!0}});var Ae=o(ke,2);u(Ae,{code:`class%20InputCancellation(BaseException)`,lang:`python`});var je=o(Ae,6);c(je,{id:`interactivetimeouterror`,children:(e,t)=>{s(),i(e,r(`InteractiveTimeoutError`))},$$slots:{default:!0}});var Me=o(je,2);u(Me,{code:`class%20InteractiveTimeoutError(modal.exception.TimeoutError)`,lang:`python`});var Ne=o(Me,4);c(Ne,{id:`internalerror`,children:(e,t)=>{s(),i(e,r(`InternalError`))},$$slots:{default:!0}});var Pe=o(Ne,2);u(Pe,{code:`class%20InternalError(modal.exception.Error%2C%20modal.exception._GRPCErrorWrapper)`,lang:`python`});var Fe=o(Pe,4);u(Fe,{code:`__init__(self%2C%20message%3DNone)`,lang:`python`});var Ie=o(Fe,2);l(Ie,{id:`message-4`,children:(e,t)=>{s(),i(e,r(`message`))},$$slots:{default:!0}});var Le=o(Ie,2);u(Le,{code:`message(self)`,lang:`python`});var Re=o(Le,2);l(Re,{id:`status-4`,children:(e,t)=>{s(),i(e,r(`status`))},$$slots:{default:!0}});var ze=o(Re,2);u(ze,{code:`status(self)`,lang:`python`});var Be=o(ze,2);l(Be,{id:`details-4`,children:(e,t)=>{s(),i(e,r(`details`))},$$slots:{default:!0}});var Ve=o(Be,2);u(Ve,{code:`details(self)`,lang:`python`});var He=o(Ve,2);c(He,{id:`internalfailure`,children:(e,t)=>{s(),i(e,r(`InternalFailure`))},$$slots:{default:!0}});var Ue=o(He,2);u(Ue,{code:`class%20InternalFailure(modal.exception.Error)`,lang:`python`});var We=o(Ue,4);c(We,{id:`invaliderror`,children:(e,t)=>{s(),i(e,r(`InvalidError`))},$$slots:{default:!0}});var Ge=o(We,2);u(Ge,{code:`class%20InvalidError(modal.exception.Error%2C%20modal.exception._GRPCErrorWrapper)`,lang:`python`});var Ke=o(Ge,4);u(Ke,{code:`__init__(self%2C%20message%3DNone)`,lang:`python`});var qe=o(Ke,2);l(qe,{id:`message-5`,children:(e,t)=>{s(),i(e,r(`message`))},$$slots:{default:!0}});var Je=o(qe,2);u(Je,{code:`message(self)`,lang:`python`});var Ye=o(Je,2);l(Ye,{id:`status-5`,children:(e,t)=>{s(),i(e,r(`status`))},$$slots:{default:!0}});var Xe=o(Ye,2);u(Xe,{code:`status(self)`,lang:`python`});var Ze=o(Xe,2);l(Ze,{id:`details-5`,children:(e,t)=>{s(),i(e,r(`details`))},$$slots:{default:!0}});var Qe=o(Ze,2);u(Qe,{code:`details(self)`,lang:`python`});var $e=o(Qe,2);c($e,{id:`logsfetcherror`,children:(e,t)=>{s(),i(e,r(`LogsFetchError`))},$$slots:{default:!0}});var et=o($e,2);u(et,{code:`class%20LogsFetchError(modal.exception.Error)`,lang:`python`});var tt=o(et,4);c(tt,{id:`modulenotmountable`,children:(e,t)=>{s(),i(e,r(`ModuleNotMountable`))},$$slots:{default:!0}});var nt=o(tt,2);u(nt,{code:`class%20ModuleNotMountable(Exception)`,lang:`python`});var rt=o(nt,2);c(rt,{id:`mountuploadtimeouterror`,children:(e,t)=>{s(),i(e,r(`MountUploadTimeoutError`))},$$slots:{default:!0}});var it=o(rt,2);u(it,{code:`class%20MountUploadTimeoutError(modal.exception.TimeoutError)`,lang:`python`});var $=o(it,4);c($,{id:`notfounderror`,children:(e,t)=>{s(),i(e,r(`NotFoundError`))},$$slots:{default:!0}});var at=o($,2);u(at,{code:`class%20NotFoundError(modal.exception.Error%2C%20modal.exception._GRPCErrorWrapper)`,lang:`python`});var ot=o(at,4);u(ot,{code:`__init__(self%2C%20message%3DNone)`,lang:`python`});var st=o(ot,2);l(st,{id:`message-6`,children:(e,t)=>{s(),i(e,r(`message`))},$$slots:{default:!0}});var ct=o(st,2);u(ct,{code:`message(self)`,lang:`python`});var lt=o(ct,2);l(lt,{id:`status-6`,children:(e,t)=>{s(),i(e,r(`status`))},$$slots:{default:!0}});var ut=o(lt,2);u(ut,{code:`status(self)`,lang:`python`});var dt=o(ut,2);l(dt,{id:`details-6`,children:(e,t)=>{s(),i(e,r(`details`))},$$slots:{default:!0}});var ft=o(dt,2);u(ft,{code:`details(self)`,lang:`python`});var pt=o(ft,2);c(pt,{id:`outputexpirederror`,children:(e,t)=>{s(),i(e,r(`OutputExpiredError`))},$$slots:{default:!0}});var mt=o(pt,2);u(mt,{code:`class%20OutputExpiredError(modal.exception.TimeoutError)`,lang:`python`});var ht=o(mt,4);c(ht,{id:`permissiondeniederror`,children:(e,t)=>{s(),i(e,r(`PermissionDeniedError`))},$$slots:{default:!0}});var gt=o(ht,2);u(gt,{code:`class%20PermissionDeniedError(modal.exception.Error%2C%20modal.exception._GRPCErrorWrapper)`,lang:`python`});var _t=o(gt,4);u(_t,{code:`__init__(self%2C%20message%3DNone)`,lang:`python`});var vt=o(_t,2);l(vt,{id:`message-7`,children:(e,t)=>{s(),i(e,r(`message`))},$$slots:{default:!0}});var yt=o(vt,2);u(yt,{code:`message(self)`,lang:`python`});var bt=o(yt,2);l(bt,{id:`status-7`,children:(e,t)=>{s(),i(e,r(`status`))},$$slots:{default:!0}});var xt=o(bt,2);u(xt,{code:`status(self)`,lang:`python`});var St=o(xt,2);l(St,{id:`details-7`,children:(e,t)=>{s(),i(e,r(`details`))},$$slots:{default:!0}});var Ct=o(St,2);u(Ct,{code:`details(self)`,lang:`python`});var wt=o(Ct,2);c(wt,{id:`remoteerror`,children:(e,t)=>{s(),i(e,r(`RemoteError`))},$$slots:{default:!0}});var Tt=o(wt,2);u(Tt,{code:`class%20RemoteError(modal.exception.Error)`,lang:`python`});var Et=o(Tt,4);c(Et,{id:`requestsizeerror`,children:(e,t)=>{s(),i(e,r(`RequestSizeError`))},$$slots:{default:!0}});var Dt=o(Et,2);u(Dt,{code:`class%20RequestSizeError(modal.exception.Error)`,lang:`python`});var Ot=o(Dt,4);c(Ot,{id:`resourceexhaustederror`,children:(e,t)=>{s(),i(e,r(`ResourceExhaustedError`))},$$slots:{default:!0}});var kt=o(Ot,2);u(kt,{code:`class%20ResourceExhaustedError(modal.exception.Error%2C%20modal.exception._GRPCErrorWrapper)`,lang:`python`});var At=o(kt,4);u(At,{code:`__init__(self%2C%20message%3DNone)`,lang:`python`});var jt=o(At,2);l(jt,{id:`message-8`,children:(e,t)=>{s(),i(e,r(`message`))},$$slots:{default:!0}});var Mt=o(jt,2);u(Mt,{code:`message(self)`,lang:`python`});var Nt=o(Mt,2);l(Nt,{id:`status-8`,children:(e,t)=>{s(),i(e,r(`status`))},$$slots:{default:!0}});var Pt=o(Nt,2);u(Pt,{code:`status(self)`,lang:`python`});var Ft=o(Pt,2);l(Ft,{id:`details-8`,children:(e,t)=>{s(),i(e,r(`details`))},$$slots:{default:!0}});var It=o(Ft,2);u(It,{code:`details(self)`,lang:`python`});var Lt=o(It,2);c(Lt,{id:`sandboxfilesystemdirectorynotemptyerror`,children:(e,t)=>{s(),i(e,r(`SandboxFilesystemDirectoryNotEmptyError`))},$$slots:{default:!0}});var Rt=o(Lt,2);u(Rt,{code:`class%20SandboxFilesystemDirectoryNotEmptyError(modal.exception.SandboxFilesystemError)`,lang:`python`});var zt=o(Rt,4);c(zt,{id:`sandboxfilesystemerror`,children:(e,t)=>{s(),i(e,r(`SandboxFilesystemError`))},$$slots:{default:!0}});var Bt=o(zt,2);u(Bt,{code:`class%20SandboxFilesystemError(modal.exception.Error)`,lang:`python`});var Vt=o(Bt,4);c(Vt,{id:`sandboxfilesystemfiletoolargeerror`,children:(e,t)=>{s(),i(e,r(`SandboxFilesystemFileTooLargeError`))},$$slots:{default:!0}});var Ht=o(Vt,2);u(Ht,{code:`class%20SandboxFilesystemFileTooLargeError(modal.exception.SandboxFilesystemError)`,lang:`python`});var Ut=o(Ht,4);c(Ut,{id:`sandboxfilesystemisadirectoryerror`,children:(e,t)=>{s(),i(e,r(`SandboxFilesystemIsADirectoryError`))},$$slots:{default:!0}});var Wt=o(Ut,2);u(Wt,{code:`class%20SandboxFilesystemIsADirectoryError(modal.exception.SandboxFilesystemError)`,lang:`python`});var Gt=o(Wt,4);c(Gt,{id:`sandboxfilesystemnotadirectoryerror`,children:(e,t)=>{s(),i(e,r(`SandboxFilesystemNotADirectoryError`))},$$slots:{default:!0}});var Kt=o(Gt,2);u(Kt,{code:`class%20SandboxFilesystemNotADirectoryError(modal.exception.SandboxFilesystemError)`,lang:`python`});var qt=o(Kt,4);c(qt,{id:`sandboxfilesystemnotfounderror`,children:(e,t)=>{s(),i(e,r(`SandboxFilesystemNotFoundError`))},$$slots:{default:!0}});var Jt=o(qt,2);u(Jt,{code:`class%20SandboxFilesystemNotFoundError(modal.exception.SandboxFilesystemError)`,lang:`python`});var Yt=o(Jt,4);c(Yt,{id:`sandboxfilesystempathalreadyexistserror`,children:(e,t)=>{s(),i(e,r(`SandboxFilesystemPathAlreadyExistsError`))},$$slots:{default:!0}});var Xt=o(Yt,2);u(Xt,{code:`class%20SandboxFilesystemPathAlreadyExistsError(modal.exception.SandboxFilesystemError)`,lang:`python`});var Zt=o(Xt,4);c(Zt,{id:`sandboxfilesystempermissionerror`,children:(e,t)=>{s(),i(e,r(`SandboxFilesystemPermissionError`))},$$slots:{default:!0}});var Qt=o(Zt,2);u(Qt,{code:`class%20SandboxFilesystemPermissionError(modal.exception.SandboxFilesystemError)`,lang:`python`});var $t=o(Qt,4);c($t,{id:`sandboxterminatederror`,children:(e,t)=>{s(),i(e,r(`SandboxTerminatedError`))},$$slots:{default:!0}});var en=o($t,2);u(en,{code:`class%20SandboxTerminatedError(modal.exception.Error)`,lang:`python`});var tn=o(en,4);c(tn,{id:`sandboxtimeouterror`,children:(e,t)=>{s(),i(e,r(`SandboxTimeoutError`))},$$slots:{default:!0}});var nn=o(tn,2);u(nn,{code:`class%20SandboxTimeoutError(modal.exception.TimeoutError)`,lang:`python`});var rn=o(nn,4);c(rn,{id:`serializationerror`,children:(e,t)=>{s(),i(e,r(`SerializationError`))},$$slots:{default:!0}});var an=o(rn,2);u(an,{code:`class%20SerializationError(modal.exception.Error)`,lang:`python`});var on=o(an,4);c(on,{id:`serverwarning`,children:(e,t)=>{s(),i(e,r(`ServerWarning`))},$$slots:{default:!0}});var sn=o(on,2);u(sn,{code:`class%20ServerWarning(UserWarning)`,lang:`python`});var cn=o(sn,4);c(cn,{id:`serviceerror`,children:(e,t)=>{s(),i(e,r(`ServiceError`))},$$slots:{default:!0}});var ln=o(cn,2);u(ln,{code:`class%20ServiceError(modal.exception.Error%2C%20modal.exception._GRPCErrorWrapper)`,lang:`python`});var un=o(ln,4);u(un,{code:`__init__(self%2C%20message%3DNone)`,lang:`python`});var dn=o(un,2);l(dn,{id:`message-9`,children:(e,t)=>{s(),i(e,r(`message`))},$$slots:{default:!0}});var fn=o(dn,2);u(fn,{code:`message(self)`,lang:`python`});var pn=o(fn,2);l(pn,{id:`status-9`,children:(e,t)=>{s(),i(e,r(`status`))},$$slots:{default:!0}});var mn=o(pn,2);u(mn,{code:`status(self)`,lang:`python`});var hn=o(mn,2);l(hn,{id:`details-9`,children:(e,t)=>{s(),i(e,r(`details`))},$$slots:{default:!0}});var gn=o(hn,2);u(gn,{code:`details(self)`,lang:`python`});var _n=o(gn,2);c(_n,{id:`snapshotcreationerror`,children:(e,t)=>{s(),i(e,r(`SnapshotCreationError`))},$$slots:{default:!0}});var vn=o(_n,2);u(vn,{code:`class%20SnapshotCreationError(modal.exception.Error)`,lang:`python`});var yn=o(vn,4);c(yn,{id:`timeouterror`,children:(e,t)=>{s(),i(e,r(`TimeoutError`))},$$slots:{default:!0}});var bn=o(yn,2);u(bn,{code:`class%20TimeoutError(modal.exception.Error)`,lang:`python`});var xn=o(bn,4);c(xn,{id:`unimplementederror`,children:(e,t)=>{s(),i(e,r(`UnimplementedError`))},$$slots:{default:!0}});var Sn=o(xn,2);u(Sn,{code:`class%20UnimplementedError(modal.exception.Error%2C%20modal.exception._GRPCErrorWrapper)`,lang:`python`});var Cn=o(Sn,4);u(Cn,{code:`__init__(self%2C%20message%3DNone)`,lang:`python`});var wn=o(Cn,2);l(wn,{id:`message-10`,children:(e,t)=>{s(),i(e,r(`message`))},$$slots:{default:!0}});var Tn=o(wn,2);u(Tn,{code:`message(self)`,lang:`python`});var En=o(Tn,2);l(En,{id:`status-10`,children:(e,t)=>{s(),i(e,r(`status`))},$$slots:{default:!0}});var Dn=o(En,2);u(Dn,{code:`status(self)`,lang:`python`});var On=o(Dn,2);l(On,{id:`details-10`,children:(e,t)=>{s(),i(e,r(`details`))},$$slots:{default:!0}});var kn=o(On,2);u(kn,{code:`details(self)`,lang:`python`});var An=o(kn,2);c(An,{id:`versionerror`,children:(e,t)=>{s(),i(e,r(`VersionError`))},$$slots:{default:!0}});var jn=o(An,2);u(jn,{code:`class%20VersionError(modal.exception.Error)`,lang:`python`});var Mn=o(jn,4);c(Mn,{id:`volumeuploadtimeouterror`,children:(e,t)=>{s(),i(e,r(`VolumeUploadTimeoutError`))},$$slots:{default:!0}});var Nn=o(Mn,2);u(Nn,{code:`class%20VolumeUploadTimeoutError(modal.exception.TimeoutError)`,lang:`python`});var Pn=o(Nn,4);c(Pn,{id:`workspacemanagementerror`,children:(e,t)=>{s(),i(e,r(`WorkspaceManagementError`))},$$slots:{default:!0}});var Fn=o(Pn,2);u(Fn,{code:`class%20WorkspaceManagementError(modal.exception.Error)`,lang:`python`});var In=o(Fn,4);c(In,{id:`simulate_preemption`,children:(e,t)=>{s(),i(e,r(`simulate_preemption`))},$$slots:{default:!0}});var Ln=o(In,2);u(Ln,{code:`simulate_preemption(wait_seconds%2C%20jitter_seconds%3D0)`,lang:`python`});var Rn=o(Ln,8);u(Rn,{code:`import%20time%0Afrom%20modal.exception%20import%20simulate_preemption%0A%0Asimulate_preemption(3)%0A%0Atry%3A%0A%20%20%20%20time.sleep(4)%0Aexcept%20KeyboardInterrupt%3A%0A%20%20%20%20print(%22got%20preempted%22)%20%23%20Handle%20interrupt%0A%20%20%20%20raise`,lang:`python`});var zn=o(Rn,2);f(o(e(zn)),{href:`https://modal.com/docs/guide/preemption`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`https://modal.com/docs/guide/preemption`))},$$slots:{default:!0}}),s(),n(zn),i(t,a)},$$slots:{default:!0}}))}export{_ as default,p as metadata};
//# sourceMappingURL=Dkfx0F432.js.map
