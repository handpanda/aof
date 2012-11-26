
/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex
%%

\s+		 /* skip whitespace */
";"			return 'semi'
[0-9]+("."[0-9]+)?\b	return 'NUMBER'

/* Reserved words */

"define"		return 'define'
"gather"		return 'gather'
"wonder"		return 'wonder'
"do"			return 'do'
"else"			return 'else'
"as"			return 'as'

/* Data Types */

"distance"		return 'distance'
"location"		return 'location'
"stat"			return 'stat'
"man"			return 'man'

/* Symbols */

"("			return '('
")"			return ')'
"{"			return "{"
"}"			return "}"

/* Operators */

"<"			return '<'
"is"			return 'is'

KICK|STAND		return 'ACTION'

[a-zA-Z]+\b		return 'NAME'
<<EOF>>	 		return 'EOF'

/lex

%left 'is' '<'

%start f

%% /* language grammar */

/* File */
f
: sl
	{console.log($1);}
;

/* Statement List */
sl
: s 'semi'
	{$$ = $1}
| s 'semi' sl
	{$$ = $1 + "\n" + $3}
| EOF
;

/* Statement */
s
: 'define' d NAME 'as' e
	{$$ = "var " + $3 + " = new " + $2 + "();"}
| 'gather' d NAME
	{$$ = "var " + $3 + " = game." + $3 + ";"}
| 'wonder' e '{' sl '}' 'else' '{' sl '}' 
	{$$ = "if " + $2 + " {\n" + $4 + "\n} else {\n" + $8 + "\n}";}
| 'do' 'ACTION'
	{$$ = "this.attemptAction(" + $2 + ")";}
;

/* Expression */
e
: '(' e ')'
	{$$ = "(" + $2 + ")"}
| e 'is' e
	{$$ = $1 + " == " + $3;}
| e '<' e
	{$$ = $1 + " < " + $3;}	
| NUMBER
	{$$ = $1}
| NAME
	{$$ = $1}
;

/* Datatype */
d
: 'distance'
	{}
| 'location'
	{}
| 'stat'
	{}
| 'man'
	{}
;

