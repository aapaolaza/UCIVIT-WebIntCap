import java.util.Set;
import java.util.Vector;
import java.util.Enumeration;
import java.util.Hashtable;

/** 
 *  Implements an ordered <code>Hashtable</code>, with elements in
 *  chronological order (i.e. insertion order) together
 *  with an additional index structure (<code>Vector</code> orderedKeysLower)
 *  for the access to elements independent from lower/upper
 *  case notation of keys.
 */

public class OrderedHashtable {
	
	/** Holds the ordered <code>Hashtable</code> keys. */
    private Vector    orderedKeys;
    
    /** holds the ordered <code>Hashtable</code> keys in lower case. */
    private Vector    orderedKeysLower;
    
    /** provides a <code>Hashtable</code> representation for name/value pairs. */
    private Hashtable hashTable;

    /**
     *  Constructor, creates an <code>OrderedHashtable</code>
     *  and instantiates the index structures.
     */
    public OrderedHashtable() {
        orderedKeys 		= new Vector();
        orderedKeysLower 	= new Vector();
        hashTable 			= new Hashtable();
    }

    /**
     *  Constructor, creates an <code>OrderedHashtable</code> and assigns 
     *  an initial capacity to the index structures.
     *  
     *  @param initialCapacity is the initial size for the index structures
     */
    public OrderedHashtable(int initialCapacity) {
        orderedKeys 		= new Vector(initialCapacity);
        orderedKeysLower 	= new Vector(initialCapacity);
        hashTable 			= new Hashtable(initialCapacity);
    }

    /**
     *  Maps the specified key to the specified value in this <code>OrderedHashtable</code>.
     *  The value can be retrieved by calling the get method with a key that is
     *  equal to the original key.
     *  
     *  @param key is the <code>Hashtable</code> key
     *  @param value is the value
     *  @return the previous value of the specified key in this
     *  <code>OrderedHashtable</code>, or null if it did not have one
     */
	public String put(String key, String value) {
        int i = orderedKeys.indexOf(key);
        if (i == -1)  {
            /**  Add key to the lists */
            orderedKeys.addElement(key); // insert (append) to the end of the list
            orderedKeysLower.addElement(key.toLowerCase()); // insert (append) to the end of the list

        } else {
            /** Replace key */
            orderedKeys.setElementAt(key, i);
            orderedKeysLower.setElementAt((key).toLowerCase(),i);
        }
        /**  Add new name/value pair to the Hashtable and return the old one */
        return (String) hashTable.put(key, value);
        
    }
    
    /**
     *  Adds the specified string with the specified key to the <code>OrderedHashtable</code>.
     *  The key is added at the specified index to the orderedKeys and orderedKeysLower
     *  structures (in lower case to orderedKeysLower).
     *  
     *  @param index is the position in the orderedKeys and orderedKeysLower <code>Vectors</code>
     *  the key is inserted at
     *  @param key is the <code>Hashtable</code> key
     *  @param value is the value to be assigned
     */
    public void add(int index, String key, String value) {
    	
    	int i = orderedKeys.indexOf(key);
        if (i == -1)  {
        	/**  Add key to the lists */
            orderedKeys.add(index, key); 	// insert at the first position
            orderedKeysLower.add(index, key.toLowerCase()); // insert at the first position

        } else {
            /**  Replace key */
            orderedKeys.setElementAt(key, i);
            orderedKeysLower.setElementAt((key).toLowerCase(),i);
        }
        hashTable.put(key, value);
    }

    
    /**
     *  Returns the value to which the specified key is mapped in this
     *  <code>Hashtable</code>.
     *  
     *  @param lowerKey is a key in the <code>OrderedHashtable</code>
     *  @return the value to which the key is mapped in this <code>Hashtable</code>, null if
     *  the key can not be mapped to any value.
     */
    public String get(String lowerKey) {
    	/** retrieve key from orderedKeys at the index which the lower case key
    	 *  is stored at in orderedKeysLower */
    	if (getLowerIndex(lowerKey)>=0) {
    		String key = (String) orderedKeys.elementAt(getLowerIndex(lowerKey));
            return (String) hashTable.get(key);
    	}
    	else return null;
    }

    /**
     *  Returns an enumeration of the keys in this <code>OrderedHashtable</code>.
     *  
     *  @return an enumeration of the keys in this <code>OrderedHashtable</code>
     */
    public Enumeration keys() {
        return orderedKeys.elements();
    }

    /**
     *  Returns an enumeration of the elements in this <code>OrderedHashtable</code>.
     *  
     *  @return an enumeration of the elements in this <code>OrderedHashtable</code>
     */
    public Enumeration elements() {
        int s = hashTable.size();
        Vector elements = new Vector(s);
        for (int i=0; i<s; i++) {
            elements.addElement(elementAt(i));
        }
        return elements.elements();
    }
    
    /**
     *  Returns a <code>Set</code> view of the entries contained in this <code>OrderedHashtable</code>.
     *  
     *  @return a <code>Set</code> of the entries in this <code>OrderedHashtable</code>
     */
    public Set entrySet() {
        return hashTable.entrySet();
    }

    /**
     *  Returns the element at the specified index.
     *  
     *  @param index is an index in this <code>OrderedHashtable</code>
     *  @return the element at the specified index
     *  @throws <code>ArrayIndexOutOfBoundsException</code>
     */
    public String elementAt(int index)
            throws ArrayIndexOutOfBoundsException {
    	if (index<orderedKeys.size()) {
    		String key = (String) orderedKeys.elementAt(index);
    		if ((String) hashTable.get(key) != "")
    			return (String) hashTable.get(key);
    		else return key;
    	} else {
    		return null;
    	}
    }

    /**
     *  Returns the key at the specified index.
     *  
     *  @param index is an index in this <code>OrderedHashtable</code>
     *  @return the key string at the specified index
     *  @throws <code>ArrayIndexOutOfBoundsException</code>
     */
    public String keyAt(int index)
            throws ArrayIndexOutOfBoundsException {
    	if (index<orderedKeys.size()) {
    		return (String) orderedKeys.elementAt(index);
    	} else {
    		return null;
    	}
    }

    /**
     *  Returns the index of the specified element 
     *  in the regular orderedKeys <code>Vector</code>.
     *  
     *  @param lowerKey is a key in the <code>OrderedHashtable</code>
     *  @return the index of the specified element
     */
    public int getIndex(String lowerKey) {
    	/** retrieve key from orderedKeys at the index which the lower case key
    	 *  is stored at in orderedKeysLower */
    	if (getLowerIndex(lowerKey)>=0) {
	    	String key = (String) orderedKeys.elementAt(getLowerIndex(lowerKey));
	        return orderedKeys.indexOf(key);
    	}
    	else return -1;
    }
    
    /**
     *  Returns the index of the specified key in the orderedKeysLower list.
     *  This makes the <code>OrderedHashtable</code> be independent from varying lower/upper-case
     *  representations of the same key.
     *  
     *  @param key is a key in the <code>OrderedHashtable</code>.
     *  @return the index of the specified string.
     */
    public int getLowerIndex(String key) {
        return orderedKeysLower.indexOf(key.toLowerCase());
    }
    
    /**
     *  Tests if the specified string is a key in this <code>OrderedHashtable</code>.
     *  
     *  @param lowerKey is a key in the <code>OrderedHashtable</code>.
     *  @return true if the specified string is a key in this <code>OrderedHashtable</code>
     */
    public boolean containsKey(String lowerKey) {
    	/** retrieve key from orderedKeys at the index which the lower case key
    	 *  is stored at in orderedKeysLower */
    	if (getLowerIndex(lowerKey)>=0) {
    		String key = (String) orderedKeys.elementAt(getLowerIndex(lowerKey));
    		return hashTable.containsKey(key);
    	} else {
    		return false;
    	}
    }

    /**
     *  Removes the key (and its corresponding value) from this <code>OrderedHashtable</code> (i.e. from
     *  all three index structures). This
     *  method does nothing if the key is not in the <code>Hashtable</code>.
     *  
     *  @param lowerKey is the key that needs to be removed
     */
    public void remove(String lowerKey) {
    	/** retrieve key from orderedKeys at the index which the lower case key
    	 *  is stored at in orderedKeysLower */
    	String key = (String) orderedKeys.elementAt(getLowerIndex(lowerKey));
        orderedKeys.removeElement(key);
        hashTable.remove(key);
        orderedKeysLower.removeElement(lowerKey.toLowerCase());
    }

    /**
     * Removes an element at the specified index.
     * 
     * @param i is the index of the element to remove
     */
    public void removeElementAt(int i) {
    	String key 		= (String) orderedKeys.elementAt(i);
    	orderedKeysLower.removeElementAt(i);
        orderedKeys.removeElementAt(i);
        hashTable.remove(key);
    }

    /**
     *  Clears this <code>OrderedHashtable</code> so that it contains no keys.
     */
    public void clear() {
    	orderedKeysLower.removeAllElements();
        orderedKeys.removeAllElements();
        hashTable.clear();
    }

    /**
     *  Returns the number of components in this <code>OrderedHashtable</code>.
     *  
     *  @return the number of components in the orderedKeys <code>Vector</code>.
     */
    public int size() {
        return orderedKeys.size();
    }

    /**
     * Recomputes the <code>OrderedHashtable</code> capacity.
     * 
     * @param capacity is the capacity to ensure
     */
    public void ensureCapacity(int capacity) {
    	orderedKeysLower.ensureCapacity(capacity);
        orderedKeys.ensureCapacity(capacity);
    }
}
