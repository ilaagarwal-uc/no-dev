OUTPUT_PATH = '/tmp/366695e9-eb09-489e-95d9-0973fc978fb2.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Wall Dimensions: 14'6" (Width) x 9' (Height)
    Opening Dimensions: 7' (Width) x 8' (Height) located at the bottom-left.
    """
    # Clear existing objects and start with a clean scene
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # Conversion factor from feet to meters (Blender default unit)
    FT_TO_M = 0.3048

    # --- Dimension Calculations ---
    # Total Width = 7' (opening area) + 7'6" (solid wall area) = 14.5 feet
    total_width_ft = 14.5
    # Total Height = 9 feet (as marked on the right)
    total_height_ft = 9.0
    # Opening Width = 7 feet
    opening_width_ft = 7.0
    # Opening Height = 8 feet (as marked next to the door frame)
    opening_height_ft = 8.0
    # Standard wall thickness (approx 4 inches)
    wall_thickness_ft = 0.333 

    # Convert to meters
    w = total_width_ft * FT_TO_M
    h = total_height_ft * FT_TO_M
    t = wall_thickness_ft * FT_TO_M
    ow = opening_width_ft * FT_TO_M
    oh = opening_height_ft * FT_TO_M

    # --- Create Main Wall ---
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall_Skeleton"
    
    # Set dimensions (X=Width, Y=Thickness, Z=Height)
    wall.dimensions = (w, t, h)
    # Position so the bottom-left corner is at the origin (0,0,0)
    wall.location = (w / 2, 0, h / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # --- Create Opening Cutter ---
    bpy.ops.mesh.primitive_cube_add(size=1)
    cutter = bpy.context.active_object
    cutter.name = "Opening_Cutter"
    
    # Set dimensions for the opening (slightly thicker Y to ensure clean boolean cut)
    cutter.dimensions = (ow, t * 2, oh)
    # Position opening at the bottom-left of the wall
    cutter.location = (ow / 2, 0, oh / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # --- Apply Boolean Operation ---
    bool_mod = wall.modifiers.new(name="Wall_Hole", type='BOOLEAN')
    bool_mod.object = cutter
    bool_mod.operation = 'DIFFERENCE'
    
    # Make wall the active object and apply the modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # Remove the cutter object from the scene
    bpy.data.objects.remove(cutter, do_unlink=True)

    # --- Export to GLB ---
    # Exporting the entire scene (which now only contains the wall skeleton)
    bpy.ops.export_scene.gltf(
        filepath='/tmp/366695e9-eb09-489e-95d9-0973fc978fb2.glb',
        export_format='GLB',
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()